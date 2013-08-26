"""
logfiedler.py is a drop in replacement for fiedler.py that takes the
-log() of the the edge weight. It does not support filtering.
Usage:
python logfiedler.py input.pwpv N

where N is the columb to use for edge weight and the first two columns
of input.pwpv are node ids.

"""
import sys
import math

import fiedler

def main():
    fn = sys.argv[1]

    col = int(sys.argv[2])

    (adj_list, iByn, nByi) = filename_parse(fn, filter_min)
    fn = os.path.basename(fn)
    fied = file_parse(fo, node2=1, val_col=col)
    for i,v in adj_list:
        adj_list[i][2]= - math.log(v[2])
    fied["adj"] = adj_list
    fied["iByn"] = iByn
    fied["nByi"] = nByi
    fo = open(fn +"."+ str(filter_min) + ".json", "w")
    json.dump(fied, fo)
    fo.close()


if __name__ == '__main__':
    main()