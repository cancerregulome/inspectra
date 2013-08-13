#!/bin/env python

import json


def readGraphJson(json_file, extra_attr):

    file = open(json_file)
    obj = json.load(file)
    file.close()

    fiedler = obj["r1"]
    adj = obj["adj"]
    labels = obj["nByi"]
    attrs = {}
    for attr in extra_attr:
      attrs[attr] = obj[attr]
    return fiedler, adj, labels, attrs
    

def rectifyGraphs(graph1, graph2):

  nodes_obj = []
  nodes = []

  for index2 in range(0,len(graph2[2])):  # for all nodes in second graph
    label2 = graph2[2][index2]  # label of node in second graph
    if label2 in graph1[2]:  # if node is also in first graph
      index1 = graph1[2].index(label2)
      obj = dict({ 'x' : graph1[0][index1], 'y' :  graph2[0][index2], 'id' : label2 })
      
      graph1_objs = {}
      for key1 in graph1[3]:
          graph1_objs.update({key1: graph1[3][key1][index1]})
      obj.update({"graph1": graph1_objs})

      graph2_objs = {}
      for key2 in graph2[3]:
          graph2_objs.update({key2: graph2[3][key2][index2]})      
      obj.update({"graph2": graph2_objs})
      
      nodes_obj.append(obj)  #keep the node
      nodes.append(label2)

  adj = []

  for graph_index, graph in enumerate([graph1, graph2]):
    for index in range(0, len(graph[1]) ):  # for all edges in first graph
      edge = graph[1][index]
      source = edge[0]
      target = edge[1]
      weight = float(edge[2])
      if (graph[2][source] in nodes and graph[2][target] in nodes):   # if label of nodes is in the new array
        new_source = nodes.index(graph[2][source])
        new_target = nodes.index(graph[2][target])
        adj.append([new_source, new_target, weight, graph_index + 1]) # keep it
      
  return { "nodes" : nodes_obj, "edges" : adj}


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
    graph1 = readGraphJson(args.graph1, ['f1'])
    graph2 = readGraphJson(args.graph2, ['f1'])
    fullGraph = rectifyGraphs(graph1, graph2)

    output = open(args.output, "w")
    json.dump(fullGraph, output)
    
    print "end"


if __name__ == '__main__':
    main()