#!/bin/env python

import json


def readGraphJson(json_file):

    file = open(json_file)
    obj = json.load(file)
    file.close()

    fiedler = obj["r1"]
    adj = obj["adj"]
    labels = obj["nByi"]
    return fiedler, adj, labels
    

def rectifyGraphs(graph1, graph2):

   extra_ind = len(graph1[2])
   graph2_fiedler = [0] * extra_ind
   label_map = {}

   for index in range(0,len(graph2[2])):
	val = graph2[2][index]
	if val in graph1[2]:
		position = graph1[2].index(val)
		label_map[index] = position
		graph2_fiedler[position] = graph2[0][index]
	else:
		graph1[2].append(val)
		label_map[index] = extra_ind
		graph2_fiedler.append(graph2[0][index])
		extra_ind = extra_ind + 1

   adj = graph1[1]
   for val in graph2[1]:
	source = int(label_map[val[0]])
	target = int(label_map[val[1]])
	value = float(val[2])
	adj.append([source,target,value])

   nodes = []
   obj = {}
   for index in range(len(graph1[0])):
	obj = { 'x': graph1[0][index], 'y': graph2_fiedler[index], 'id': graph1[2][index] }
	nodes.append(obj)

   return { "nodes" : nodes, "edges" : adj}


def parse_parameters():
    import argparse
    parser = argparse.ArgumentParser(description = 'Subset Feature Matrix by samples according to fold definition and specified fold/repetition')
    parser.add_argument('--graph1', nargs = '?' , required=True,
                            help = 'input first json graph file. e.g. /path/to/data/graph1.json')
    parser.add_argument('--graph2', nargs = '?' , required=True,
                            help = 'input second json graph file. e.g. /path/to/data/graph2.json')
    parser.add_argument('--output', nargs = '?', required=True,
                            help = 'output json graph file. e.g. /path/to/output/graph.json')

    return parser.parse_args()



def main():
    args = parse_parameters()
    graph1 = readGraphJson(args.graph1)
    graph2 = readGraphJson(args.graph2)
    fullGraph = rectifyGraphs(graph1, graph2)
    print fullGraph['edges']

    output = open(args.output, "w")
    json.dump(fullGraph, output)
    
    print "end"


if __name__ == '__main__':
    main()   
    

