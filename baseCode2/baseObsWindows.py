import argparse
import numpy as np
import matplotlib.pyplot as plt
import os
        
def slidingObsWindow(data,lengthObsWindow,slidingValue,basename):
    iobs=0
    nSamples,nMetrics=data.shape
    obsData=np.zeros((0,lengthObsWindow,nMetrics))
    for s in np.arange(lengthObsWindow,nSamples,slidingValue):
        subdata=data[s-lengthObsWindow:s,:]
        obsData=np.insert(obsData,iobs,subdata,axis=0)
        
        obsFname="{}_obs{}_w{}.dat".format(basename,iobs,lengthObsWindow)
        iobs+=1
        np.savetxt(obsFname,subdata,fmt='%d')
               
    return obsData # 3D arrays (obs, sample, metric)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('-i', '--input', nargs='?',required=True, help='input file')
    parser.add_argument('-w', '--widths', nargs='*',required=False, help='list of observation windows widths',default=120)  #2 minutos
    parser.add_argument('-s', '--slide', nargs='?',required=False, help='observation windows slide value',default=20)        #deslizar 20
    args=parser.parse_args()
    
    fileInput=args.input
    
    lengthObsWindow=[int(w) for w in args.widths]
    slidingValue=int(args.slide)
        
    data = np.loadtxt(fileInput, dtype=int, encoding='latin1')

    fname=''.join(fileInput.split('.')[:-1])
    
    dirname=fname+"_obs_s{}".format(slidingValue)
    
    os.mkdir(dirname)
    basename=dirname+"/"+fname
    
    
    print("\n\n### SLIDING Observation Windows with Length {} and Sliding {} ###".format(lengthObsWindow[0],slidingValue))
    obsData=slidingObsWindow(data,lengthObsWindow[0],slidingValue,basename)
    print(obsData)
            
if __name__ == '__main__':
    main()
