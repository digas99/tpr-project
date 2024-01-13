import argparse
import scipy.stats as stats
import numpy as np
import matplotlib.pyplot as plt

import os

   
def extractStats(data):
    nSamp,nCols=data.shape

    M1=np.mean(data,axis=0)
    Md1=np.median(data,axis=0)
    Std1=np.std(data,axis=0)
    # S1=stats.skew(data)
    #K1=stats.kurtosis(data)
    p=[75,90,95,98]
    Pr1=np.array(np.percentile(data,p,axis=0)).T.flatten()
        
    features=np.hstack((M1,Md1,Std1,Pr1))
    return(features)

def extratctSilenceActivity(data,threshold=0):
    if(data[0]<=threshold):
        s=[1]
        a=[]
    else:
        s=[]
        a=[1]
    for i in range(1,len(data)):
        if(data[i-1]>threshold and data[i]<=threshold):
            s.append(1)
        elif(data[i-1]<=threshold and data[i]>threshold):
            a.append(1)
        elif (data[i-1]<=threshold and data[i]<=threshold):
            s[-1]+=1
        else:
            a[-1]+=1
    return(s,a)
   
def extractStatsSilenceActivity(data):
    features=[]
    nSamples,nMetrics=data.shape
    silence_features=np.array([])
    activity_features=np.array([])
    for c in range(nMetrics):
        silence,activity=extratctSilenceActivity(data[:,c],threshold=0)
        
        if len(silence)>0:
            silence_faux=np.array([len(silence),np.mean(silence),np.std(silence)])
        else:
            silence_faux=np.zeros(3)
        silence_features=np.hstack((silence_features,silence_faux))
        
        if len(activity)>0:
            activity_faux=np.array([len(activity),np.mean(activity),np.std(activity)])
        else:
            activity_faux=np.zeros(3)
        activity_features=np.hstack((activity_features,activity_faux))       
            
    features=np.hstack((silence_features,activity_features))
        
    return(features)

def extractFeatures(dirname,basename,nObs,allwidths):
    for o in range(0,nObs):
        features=np.array([])
        featuresS=np.array([])
        for oW in allwidths:
            obsfilename=dirname+"/"+basename+str(o)+"_w"+str(oW)+".dat"
            print(obsfilename)
            subdata=np.loadtxt(obsfilename)[:,1:]    #Loads data and removes first column (sample index)
                
            faux=extractStats(subdata)    
            features=np.hstack((features,faux))
            print(subdata)
            print(faux.shape)
            
            faux2=extractStatsSilenceActivity(subdata)
            featuresS=np.hstack((featuresS,faux2))
            print(faux2.shape)

        if o==0:
            obsFeatures=features
            obsFeaturesS=featuresS
        else:
            obsFeatures=np.vstack((obsFeatures,features))
            obsFeaturesS=np.vstack((obsFeaturesS,featuresS))

    return obsFeatures,obsFeaturesS

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('-i', '--input', nargs='?',required=True, help='input dir')
    parser.add_argument('-w', '--widths', nargs='*',required=True, help='list of observation windows widths')
    args=parser.parse_args()
    
    dirname=args.input
    if isinstance(args.widths, list):
        allwidths=args.widths
    else:
        allwidths=list(args.widths)
    
    allfiles=os.listdir(dirname)
    nObs=len([f for f in allfiles if '_w{}.'.format(allwidths[0]) in f])
    lbn=allfiles[0].rfind("obs")+3
    basename=allfiles[0][:lbn]
    
    features=extractFeatures(dirname,basename,nObs,allwidths)
    
    outfilename=basename+"_features.dat"
    outfilenameS=basename+"_Sfeatures.dat"
    
    np.savetxt(outfilename,features[0],fmt='%d')
    np.savetxt(outfilenameS,features[1],fmt='%d')
    
    print(features[0].shape)
    print(features[1].shape)
        

if __name__ == '__main__':
    main()
