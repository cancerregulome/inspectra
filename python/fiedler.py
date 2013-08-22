#!/usr/bin/env python
# Copyright (c) 2012, the GraphSpectrometer Contributors listed at 
# http://github.com/ryanbressler/GraphSpectrometer/graphs/contributors
# All rights reserved.

# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#     * Redistributions of source code must retain the above copyright
#       notice, this list of conditions and the following disclaimer.
#     * Redistributions in binary form must reproduce the above copyright
#       notice, this list of conditions and the following disclaimer in the
#       documentation and/or other materials provided with the distribution.
#     * Neither the name of The Institute for Systems Biology, GraphSpectrometer nor the
#       names of its contributors may be used to endorse or promote products
#       derived from this software without specific prior written permission.

# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
# DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
# ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
"""

python script/module that uses pyamg to calculat and plot fiedler vectors of a graph
using pyamg,numpy and scipy.

Input:
A sif file or any three column white space deliminated file with the first and 
third column repesenting node names and each row repesenting an edge.

Comand line Usage:
python fiedler.py my.sif

Can also be used on rf-ace output files provided the file has a ".out" exstension
or pairwise files with a ".pwpv" extension. 

Or with x args as a thread pool to plot many sif files:
ls *.sif | xargs --max-procs=8 -I FILE  python fiedler.py FILE

A minimum edge cutoff can also be specified:
fiedler.py FILE .5 


By default generates a number of pngs of diffrent sorts of plots and a .json file containing: 

{"f1": the first fiedler vector,
"f2": (if caclulated) the second fideler vector
"d": the node degrees,
"r1": the rank of each node in the first fiedler vector
"r2": the rank of each node in the second fiedler vector
"iByn": the index of the nodes by the string used to represent them in the input file
"nByi": the string used to represent nodes in the input file by their index in the graph
"adj": the adjascancy list}

Author/Contact:Ryan Bressler, ryan.bressler@systemsbiology.org/gmail.com

"""




import sys
import json
import math
import random
import itertools
import os

try:
    import hypergeom
except ImportError:
    print "hypergeom not found"

import numpy
import scipy
from scipy.sparse.linalg import lobpcg
from scipy import linalg
from scipy.sparse import coo_matrix

from pyamg import smoothed_aggregation_solver

import matplotlib as mpl
import pylab as pl
import matplotlib.path as mpath
import matplotlib.patches as mpatches
import matplotlib.pyplot as plt

from sklearn import mixture
from sklearn.cluster import DBSCAN




def file_parse(fo, node1=0, node2=1, filter_col=-1, filter_min=.5, val_col=-1, blacklist=[]):
    """parse a sif like file into an adjascancy list by index in a matrix and node name look up tables.

    Takes:
    f0: A file like object containing a sif or similar white space deliminated file containing at at least 2
    columns of node names that are legal python dictionary keys deliminated by tabs or spaces.

    node1=0 : the index of the column containing the first node
    node2=2 : the index of the column containing the second node2

    Returns a tuple containing:


    An Nx2 nested list of ints of the form:
    [[node1,node2],
    ...]
    Representing the adjascancy list.

    A dictionary containing int ids in the above by the string name in the input file.

    An array of strings containing the name in the input by the int id.
    """

    
    out = []
    intidsbyname = {}
    namesbyintid = []

    incintid=0
    
    len_blacklist=len(blacklist)
    for line in fo:
        if line[1]=="#":
            continue
        vs = line.rstrip().split()
        if len(vs)>node2:
            if filter_col!=-1:
                if math.fabs(float(vs[filter_col]))<filter_min:
                    continue
            if len_blacklist>0:
                skip = False
                for black_sheep in blacklist:
                    for strid in [vs[node1],vs[node2]]:
                        if strid.find(black_sheep)!=-1:
                            skip = True
                            continue
                    if skip==True:
                        continue
                if skip==True:
                        continue


            for strid in [vs[node1],vs[node2]]:
                if not strid in intidsbyname:
                    intidsbyname[strid]=incintid
                    namesbyintid.append(strid)
                    incintid = incintid+1 
            row =[intidsbyname[vs[node1]],intidsbyname[vs[node2]]]

            if val_col!=-1:
                row.append(math.fabs(float(vs[val_col])))

            
            out.append(row)
        
    fo.close()
    return (out,intidsbyname,namesbyintid)

def adj_mat(adj_list):
    """get the graph laplacian (in coo_matrix sparse matrix form) of an 
    adjancy list.0
    
    Takes:

    An Nx2 nested list of ints of the form:
    [[node1,node2],
    ...]
    or an Nx3 list in the form:
    [[node1,node2,value],
    ...]
    Representing the adjascancy list.

    Returns
    The adjasancy matrix in coo_matrix format.
    """
    adj=numpy.array(adj_list)
    Npts = numpy.max(adj[:,:2])+1
    data = numpy.ones(adj.shape[0],dtype=float)
    if adj.shape[1]>2:
        data=adj[:,2]
    A = coo_matrix((data,(adj[:,0],adj[:,1])), shape=(Npts,Npts))
    return (A,adj,Npts)

def adj_list(adj_mat,includeValue=True):
    am=adj_mat.tocoo()
    rv=numpy.column_stack((am.row,am.col,am.data)).tolist()
    for row in rv:
        row[0]=int(row[0])
        row[1]=int(row[1])
    return rv


def graph_laplacian(adj_list):
    """get the graph laplacian (in coo_matrix sparse matrix form) of an 
    adjancy list.0
    
    Takes:

    An Nx2 nested list of ints of the form:
    [[node1,node2],
    ...]
    Representing the adjascancy list.

    Returns
    The graph laplaciian in coo_matrix format.
    """
    (A,adj,Npts) = adj_mat(adj_list)
    A = -1*(A.T + A)/2
    A=A.tocsr()
    if len(adj_list[0])==2:
        A.data = -1*numpy.ones((A.nnz,),dtype=float)
    A.setdiag(numpy.zeros((Npts,),dtype=float))
    A.setdiag(-1*numpy.array(A.sum(axis=1)).ravel())
    return A.tocsr()


def fiedler(adj_list,plot=False,fn="FiedlerPlots",n_fied=2):
    """calculate the first fiedler vector of a graph adjascancy list and optionally write associated plots to file.

    Takes:
    adj_list:
    An Nx2 nested list of ints of the form:
    [[node1,node2],
    ...]
    Representing the adjascancy list.

    plot=False: make plots or not.
    fn="FiedlerPlots": filename to prepend to the plot png file names
    n_fied=2: the number of fiedler vectors to calculate (values above 2 will not be output)

    Returns a Dictionary of the form:



    {"f1": the first fiedler vector,
    "f2": (if caclulated) the second fideler vector
    "d": the node degrees,
    "r1": the rank of each node in the first fiedler vector
    "r2": the rank of each node in the second fiedler vector}


    """
    

    A = graph_laplacian(adj_list)

    # construct preconditioner
    ml = smoothed_aggregation_solver(A, coarse_solver='pinv2',max_coarse=10)
    M = ml.aspreconditioner()

    # solve for lowest two modes: constant vector and Fiedler vector
    X = scipy.rand(A.shape[0], n_fied+1)
    (eval,evec,res) = lobpcg(A, X, M=None, tol=1e-12, largest=False, \
            verbosityLevel=0, retResidualNormsHistory=True)

    if plot:
        doPlots(evec[:,1],evec[:,2],A.diagonal(),adj_list,fn)
        
        
    out = {"f1":list(evec[:,1]),"d":list(A.diagonal()),"r1":[int(i) for i in list(numpy.argsort(numpy.argsort(evec[:,1])))]}
    if n_fied > 1:
        out["f2"]=list(evec[:,2])
        out["r2"]=[int(i) for i in list(numpy.argsort(numpy.argsort(evec[:,2])))]
    return out
    




#Plots are not optimized ...ie they end up sorting the same thing multiple times
def doPlots(f1,f2,degrees,adj_list,fn,widths=[16],heights=False,vsdeg=True,nByi=False,adj_list2=False,directed=False,dbscan_eps=0,dbscan_rank_eps=0,enrichdb="",clust_x=False,clust_y=False,clust_xy=True,dorank=True,doraw=True):
    # output first
    if vsdeg:
        plotFiedvsDeg(f1,degrees,fn)

    #if n_fied>1:
    for i,width in enumerate(widths):
        height=width
        if heights!=False:
            height=heights[i]
        #output fied vs fied:
        plotFiedvsFied(f1,f2,fn,adj_list=adj_list,adj_list2=adj_list2,width=width,height=height,nByi=nByi,directed=directed,dbscan_eps=dbscan_eps,dbscan_rank_eps=dbscan_rank_eps,enrichdb=enrichdb,clust_x=clust_x,clust_y=clust_y,clust_xy=clust_xy,dorank=dorank,doraw=doraw)

    #output second
    if vsdeg:
        plotFiedvsDeg(f2,degrees,fn+".second")

def plotEdges(x,y,ax,adj_list,width,height,color="green",directed=False):
    #codes=[]
    #points=[]
    emax = x.max()
    for edge in adj_list:
        #points[len(points):]=[(x[edge[0]],y[edge[0]]),(x[edge[1]],y[edge[1]])]
        points=[(x[edge[0]],y[edge[0]]),(x[edge[1]],y[edge[1]])]
        #codes[len(codes):]=[mpath.Path.MOVETO,mpath.Path.LINETO]
        codes=[mpath.Path.MOVETO,mpath.Path.LINETO]
        alpha=.5
        if len(edge)>2: 
            alpha=0
            if float(edge[2])>0:
                #alpha=math.sqrt(float(edge[2]))
                alpha=float(edge[2])

        if directed:
            dx=points[1][0]-points[0][0]
            dy=points[1][1]-points[0][1]
            length = math.sqrt(dx*dx+dy*dy)
            head_width=emax*.3*length/(width*math.fabs(dy)+height*math.fabs(dx))
            head_length=emax*.4*length/(height*math.fabs(dy)+width*math.fabs(dx))

            ax.arrow(points[0][0],points[0][1],dx,dy,width=.2*head_width,head_width=head_width,head_length=head_length,color=color,alpha=alpha,length_includes_head=True)
        else:
            patch = mpatches.PathPatch(mpath.Path(points,codes), edgecolor=color, lw=.2,alpha=alpha)
            ax.add_patch(patch)

def PlotEdgeVvsEdgeV(adj1,adj2,nByi1,nByi2,fn,width=16):
    edgevs = {}
    nedges = 0
    nByis=[nByi1,nByi2]
    for i,adj in enumerate([adj1,adj2]):
        for edge in adj:
            [e0,e1,v]=edge
            e0=nByis[i][e0]
            e1=nByis[i][e1]
            if not e0 in edgevs:
                edgevs[e0]={}
            if not e1 in edgevs[e0]:
                edgevs[e0][e1]={}
                nedges+=1
            edgevs[e0][e1][i]=float(v)
    x = numpy.zeros((nedges,),dtype=float)
    y = numpy.zeros((nedges,),dtype=float)
    i = 0
    for n0 in edgevs:
        for n1 in edgevs[n0]:
            e = edgevs[n0][n1]
            if 0 in e:
                x[i]=e[0]
            if 1 in e:
                y[i]=e[1]
            i=i+1

    F = plt.figure()
    ax = F.add_subplot(111)
    
    ax.scatter(x, y,zorder=2)
    i = 0
    for n0 in edgevs:
        for n1 in edgevs[n0]:
            plt.annotate(   
                "->".join([":".join(n.split(":")[1:3]) for n in [n0,n1]]),
                xy = (x[i], y[i]), xytext = (-0, 0),
                textcoords = 'offset points', ha = 'right', va = 'bottom',size=8,alpha=.4)
            i+=1

    ax.grid(True)
    F.set_size_inches( (width,width) )
    F.savefig(fn+".EdgeVvsEdgeV.width%s.pdf"%(width),bbox_inches='tight')
    F.clear()




def doDbScan(plt,ax,fied1,fied2,fn,adj_list,adj_list2,width,height,nByi,directed,gmmcomponents,dbscan_eps,enrichdb,axis="xy"):
    """
    add enriched dbscan information to a plot

    """
    X=0
    minormin = 0
    if axis == "x":
        print "dbscaning x at %s"%(dbscan_eps)
        X=numpy.transpose(numpy.column_stack((fied1)))
        minormin = fied2.min()
    elif axis == "y":
        print "dbscaning y at %s"%(dbscan_eps)
        X=numpy.transpose(numpy.column_stack((fied2)))
        minormin = fied1.min()
    else:
        print "dbscaning xy at %s"%(dbscan_eps)
        X=numpy.column_stack((fied1,fied2))
    db = DBSCAN(eps=dbscan_eps, min_samples=10).fit(X)
    core_samples = db.core_sample_indices_
    labels = db.labels_
    print "Found %s core samples and %s labels"%(len(core_samples),len(labels))
    colors=[(random.random(),random.random(),random.random()) for el in labels]
    backgroundgenes =[]
    enrich=False
    enriched = []
    if nByi!=False and enrichdb!="":
        enrich=True
        backgroundgenes = [gene for gene in [nodelabel.split(":")[2] for nodelabel in nByi] if gene!=""]
    for k, col in zip(set(labels), colors):
        if k == -1:
            # Black used for noise.
            col = 'k'
            markersize = 6
        elif enrich:
            memberins = numpy.argwhere(labels == k)
            setgenes = [nByi[i].split(":")[2] for i in memberins]
            setgenes = numpy.array([gene for gene in setgenes if gene!=""])
            enrichedsets = hypergeom.enrich(setgenes,backgroundgenes,enrichdb,verbose=False)
            enriched.append({"indexes":memberins.tolist(),"genes":setgenes.tolist(),"sets":enrichedsets})
            text=str(len(enriched))
            
            if len(enrichedsets)>0:
                text=":".join([text,enrichedsets[0][0].replace("_"," "),str(enrichedsets[0][2])])
            if axis == "x":
                labelPoints(plt,[numpy.mean(fied1[memberins])],[minormin],[text],size=24,zorder=4,alpha=.8,color=col,rotation='vertical',ha="left",trim=False)
            elif axis == "y":
                labelPoints(plt,[minormin],[numpy.mean(fied2[memberins])],[text],size=24,zorder=4,alpha=.8,color=col,ha="left",trim=False)
            else:
                labelPoints(plt,[numpy.mean(fied1[memberins])],[numpy.mean(fied2[memberins])],[text],size=14,zorder=4,alpha=.6,color=col,ha="center",trim=False)
        class_members = [index[0] for index in numpy.argwhere(labels == k)]
        cluster_core_samples = [index for index in core_samples
                                if labels[index] == k]
        for index in class_members:
            x = X[index]
            if index in core_samples and k != -1:
                markersize = 6

            else:
                markersize = 6
            if k!=-1:
                if axis == "x":
                    plotCircles(ax,[(x[0],minormin)],dbscan_eps,col,edgecolor=col,alpha=.01,zorder=-1)
                elif axis == "y":
                    plotCircles(ax,[(minormin,x[0])],dbscan_eps,col,edgecolor=col,alpha=.01,zorder=-1)
                else:
                    plotCircles(ax,[(x[0],x[1])],dbscan_eps,col,edgecolor=col,alpha=.01,zorder=-1)

            if axis == "xy":
                ax.plot(x[0], x[1], 'o', markerfacecolor=col, markeredgecolor='k', markersize=markersize,alpha=.4)
    if enrich:
        
        fo = open (fn+".clusts.json","w")
        json.dump(enriched,fo)
        fo.close()

def doSinglePlot(fied1,fied2,fn,adj_list=False,adj_list2=False,width=16,height=False,nByi=False,directed=False,gmmcomponents=0,dbscan_eps=0,enrichdb="",clust_x=0,clust_y=0,clust_xy=True):
    """ make scatter plots and rank v rank plots and write to files.

    Takes
    fied1: the fiedler vector to use as the x axis
    fied2: the fiedler vector to use as the y axis
    fn: the filename to prepend"""
    plt.axis('off')
    if height==False:
        height=width
    F = plt.figure()
    ax = F.add_subplot(111)
    ax.get_xaxis().set_visible(False)
    ax.get_yaxis().set_visible(False)
    
    if gmmcomponents>1:
        dpgmm = mixture.DPGMM(gmmcomponents,"full",alpha=.1,thresh=1e-2)
        #dpgmm = mixture.GMM(gmmcomponents,"full",thresh=1e-10)
        xmax=float(numpy.max(fied1))
        ymax=float(numpy.max(fied2))
        X=numpy.column_stack((fied1/xmax,fied2/ymax))
        dpgmm.fit(X)
        Y_ = dpgmm.predict(X)
        #color_iter = itertools.cycle(['r', 'g', 'b', 'c', 'm'])

        colors=((random.random(),random.random(),random.random()) for el in dpgmm.means_)
        for i, (mean, covar, color) in enumerate(zip(dpgmm.means_, dpgmm._get_covars(),colors)):
            if not numpy.any(Y_ == i):
                continue
            v, w = linalg.eigh(covar)
            u = w[0] / linalg.norm(w[0])
            ax.scatter(X[Y_ == i, 0]*xmax, X[Y_ == i, 1]*ymax, 2, color=color,zorder=2)

            # Plot an ellipse to show the Gaussian component
            angle = numpy.arctan(u[1] / u[0])
            angle = 180 * angle / numpy.pi  # convert to degrees
            print "Ploting elipse: %s"%(", ".join([str(el) for el in [mean, v[0], v[1], 180 + angle, color]]))
            ell = mpl.patches.Ellipse([mean[0]*xmax,mean[1]*ymax], v[0]*xmax, v[1]*ymax, 180 + angle, color=color)
            ell.set_clip_box(ax.bbox)
            ell.set_alpha(0.5)
            ax.add_artist(ell)
    elif dbscan_eps>0 or clust_x > 0 or clust_y > 0:
        if clust_xy>0:
            print "clust_xy:"+str(clust_xy)
            doDbScan(plt,ax,fied1,fied2,fn,adj_list,adj_list2,width,height,nByi,directed,gmmcomponents,dbscan_eps,enrichdb)
        if clust_x>0:
            doDbScan(plt,ax,fied1,fied2,fn+".x.",adj_list,adj_list2,width,height,nByi,directed,gmmcomponents,clust_x,enrichdb,axis="x")
        if clust_y>0:
            doDbScan(plt,ax,fied1,fied2,fn+".y.",adj_list,adj_list2,width,height,nByi,directed,gmmcomponents,clust_y,enrichdb,axis="y")
        if clust_xy==False or clust_xy == 0:
            ax.scatter(fied1, fied2,s=10,alpha=0.4,zorder=2)
        
                

    else:
        ax.scatter(fied1, fied2,s=10,alpha=0.4,zorder=2)
    if not adj_list==False:
        plotEdges(fied1,fied2,ax,adj_list,width,height,directed=directed)
    if not adj_list2==False:
        plotEdges(fied1,fied2,ax,adj_list2,width,height,color="red",directed=directed)
    if not nByi==False:
        labelPoints(plt,fied1,fied2,nByi=nByi)
    #ax.grid(True)
    min1=numpy.min(fied1)
    max1=numpy.max(fied1)
    pad1=.05*(max1-min1)
    min2=numpy.min(fied2)
    max2=numpy.max(fied2)
    pad2=.05*(max2-min2)
    ax.set_xlim([min1-pad1, max1+pad1])
    ax.set_ylim([min2-pad2, max2+pad2])
    ax.set_xmargin(0)
    ax.set_ymargin(0)
    
    F.set_size_inches( (width,height) )
    F.savefig(fn+".png",bbox_inches='tight',pad_inches=0)
    #F.savefig(fn+".svg",bbox_inches='tight')

    F.clear()

def plotCircles(ax,xy,radius,facecolor,alpha=.5,edgecolor="k",zorder=-1):
    for point in xy:
        patch = mpatches.Circle(point,radius=radius,facecolor=facecolor,edgecolor=edgecolor,alpha=alpha,linewidth=0,zorder=-1)
        ax.add_patch(patch)


def plotFiedvsFied(fied1,fied2,fn,adj_list=False,adj_list2=False,width=16,height=False,nByi=False,directed=False,gmmcomponents=0,dbscan_eps=0,dbscan_rank_eps=0,enrichdb="",clust_x=False,clust_y=False,clust_xy=True,dorank=True,doraw=True):
    """ make scatter plots and rank v rank plots and write to files.

    Takes
    fied1: the fiedler vector to use as the x axis
    fied2: the fiedler vector to use as the y axis
    fn: the filename to prepend"""
    if doraw:
        doSinglePlot(fied1,fied2,fn+".fied1vfied2.width%s"%(width),adj_list,adj_list2,width,height,nByi,directed,gmmcomponents,dbscan_eps,enrichdb,clust_x,clust_y,clust_xy)

    if dorank:
        sortx=numpy.argsort(numpy.argsort(fied1))
        sorty=numpy.argsort(numpy.argsort(fied2))

        doSinglePlot(sortx,sorty,fn+".fied1rank.v.fied2rank.width%s"%(width),adj_list,adj_list2,width,height,nByi,directed,gmmcomponents,dbscan_rank_eps,enrichdb,clust_x,clust_y,clust_xy)

def labelPoints(plt,x,y,nByi,size=6,zorder=3,alpha=.4,color="k",rotation=0,ha="right",trim=True):
    for i,xi in enumerate(x):
        text = nByi[i]
        if trim:
            vs = text.split(":")
            newvs = vs[1:3]
            newvs.append(vs[-1])
            text = ":".join(newvs)
        plt.annotate(
            text,
            xy=(xi, y[i]),
            xytext=(-1, 1),
            textcoords='offset points', ha = ha, va = 'bottom',size=size,alpha=alpha,zorder=zorder,color=color,rotation=rotation)


def plotFiedvsDeg(fied, degree,fn):
    """ make fied vs degree and fiedler rank vs degree plots and write to files.

    Takes
    fied: the fiedler vector to use as the x axis
    degree: the degree of the nodes
    fn: the filename to prepend"""
    F = plt.figure()
    ax = F.add_subplot(111)
    ax.scatter(fied, numpy.log2(degree))
    ax.grid(True)

    F.set_size_inches( (64,8) )
    F.savefig(fn+".fiedler.vs.log2.degree.png")
    F.clear()

    F = plt.figure()
    ax = F.add_subplot(111)

    order = numpy.argsort(fied)
    ax.scatter(numpy.arange(0,fied.size), numpy.log2(degree[order]))
    ax.grid(True)

    F.set_size_inches( (64,8) )
    F.savefig(fn+".fiedler.ranks.vs.log2.degree.png")
    F.clear()

    
def filename_parse(fn, filter_min=.001):
    """Wraps file_parse and infers paramaters based on extensions.

    Takes:
    filename.

    ".out" files will be treated as rf-ace output and filtered by imortance

    all other files will be treated as sif files.

    returns:
    The same tuple as filename_parse
    """

    fo = open(fn)
    out = ()
    if fn[-4:] == ".out":
        out = file_parse(fo, node2=1, filter_col=3, filter_min=filter_min, val_col=3)
    elif fn[-5:] == ".pwpv":
        out = file_parse(fo, node2=1, filter_col=2, filter_min=filter_min, val_col=2, blacklist=["PRDM", "CNVR"])
    elif fn[-4:] == ".tsv":
        out = file_parse(fo, node2=1, filter_col=2, filter_min=filter_min, val_col=2)
    else:
        out = file_parse(fo)
    fo.close()
    return out


def main():
    fn = sys.argv[1]
    filter_min = ""
    if len(sys.argv) > 2:
        filter_min = float(sys.argv[2])

    (adj_list, iByn, nByi) = filename_parse(fn, filter_min)
    fn = os.path.basename(fn)
    fied = fiedler(adj_list, fn=fn + str(filter_min), plot=False, n_fied=2)
    fied["adj"] = adj_list
    fied["iByn"] = iByn
    fied["nByi"] = nByi
    fo = open(fn +"."+ str(filter_min) + ".json", "w")
    json.dump(fied, fo)
    fo.close()


if __name__ == '__main__':
    main()





