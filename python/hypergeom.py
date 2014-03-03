#!/usr/bin/env python
"""
Hypergeom.py
Ryan Bressler, Institute for Systems Biology

Simple script and functions for doing hypergeometric testing against gene sets in a gmt file from the broad:
http://www.broadinstitute.org/gsea/downloads.jsp

Comand line usage:
hypergeom.py genes.txt backgroundgenes.txt pathwaydb.gmt

Where the txt files are whitespace sperated lists of the same symbols used in the gmt.

Output is dab deliminated and printed to standard out with each row consiting of the pathway name, and link
provided in the gmt and the (hypergeometric) probability that at least as many genes from that pathway were 
obseved as occured in the input set. Ie 1-CFF(n-1) where n is the number of genes observed.



"""
import numpy as np
import sys
from scipy.stats import hypergeom

def loadList(filename):
	"""
	loadList
	loads a list of space/tab seperated symbols from a file

	Arguments:
	filename: name of the file to load

	Returns:
	a numpy array of items
	"""
	fo= open(filename)
	data = np.array(fo.read().rstrip().split())
	fo.close()
	return data

def enrich(inputgenes,backgroundgenes,dbfilename,verbose=False,returnn=20):
	"""
	enrich
	perform hypergeometric testing of a set of genes drawn from a background against gene sets in a 
	gmt file. "P values" are the (hypergeometric) probability that at least as many genes from each pathway were 
	obseved as occured in the input set. Ie 1-CFF(n-1) where n is the number of genes observed.

	Arguments:
	inputgenes: a numpy.array of gene symbols representing the set to be analized
	backgroundgenes: a numpy.array of gene symbols representing the background from which the set was drawn
	dbfilename: the filename of a gmt file (available at http://www.broadinstitute.org/gsea/downloads.js) containting
	the sets to be enriched against
	verbose=False:If true print output to standard out
	returnn=20:return at most this many sets

	Returns:
	An array of arrays where each iner array contains the name, link and p value of a pathway. Entries are sorted by 
	p value in ascending order. Example
	[["name","http://link",.0001]
	]

	""" 
	genes=np.unique(inputgenes)
	background = np.unique(backgroundgenes)
	ntrys = len(genes)
	total= len(background)
	gmtDB = open(dbfilename)
	names =[]
	links =[]
	probs =[]
	for line in gmtDB:
		vs=line.rstrip().split("\t")
		setgenes=np.array(vs[2:])
		nfound = np.sum(np.in1d(genes,setgenes,assume_unique=True))
		if nfound > 1:
			npresent = np.sum(np.in1d(setgenes,background,assume_unique=True))
			prob = hypergeom.sf(nfound-1,total,npresent,ntrys)
			names.append(vs[0])
			links.append(vs[1])
			probs.append(prob)
			if verbose:
				print "\t".join([vs[0],vs[1],str(prob)])
	gmtDB.close()
	sortedarray = []
	for i in  np.argsort(np.array(probs))[0:returnn]:
		sortedarray.append([names[i],links[i],probs[i]])
	return sortedarray
	

def main():
	genes = loadList(sys.argv[1])
	background = loadList(sys.argv[2])
	enrich(genes,background,sys.argv[3],verbose=True)

if __name__ == '__main__':
	main()