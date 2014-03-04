import sys
import subprocess


def main():
	fm = sys.argv[1]
	tmpDir = sys.argv[2]	

	subprocess.call["/users/rkramer/bin/python3", "/titan/cancerregulome8/TCGA/scripts/prep4pairwise.py", fm])
	binFile = fm +".bin"

	runlist=open("runlist.tmp","w")
	fmfo = open(fm)

	fmfo.next()
	for index,line in enumerate(fmfo):
		#runlist.write("1 %s -i %s\n"%(feature,fm))
		outName = tmpDir + "/" + str(index) + ".pw"
		cmdString = "1 /titan/cancerregulome8/TCGA/scripts/pairwise-1.1.2"
		#cmdString += " --pvalue %g --min-ct-cell %d --min-mx-cell %d --min-samples %d" \
		#    % (args.pvalue, args.min_ct_cell, args.min_mx_cell, args.min_samples)
		cmdString += " --outer %d:%d:1 --inner +1::1  %s  %s " \
		    % (index, index + 1, binFile, outName)
		runlist.write("%s\n" % cmdString)

	if len(sys.argv)>3:
		clusterinvocation = sys.argv[3:]
		clusterinvocation.append(runlist)
		subprocess.call(clusterinvocation)

if __name__ == '__main__':
	main()