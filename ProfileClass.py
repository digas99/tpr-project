from more_itertools import tabulate
import numpy as np
import scipy.stats as stats
import scipy.signal as signal
import matplotlib.mlab as mlab
import matplotlib.pyplot as plt
from sklearn.cluster import DBSCAN, KMeans
from sklearn.neighbors import LocalOutlierFactor
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import time
import sys
import warnings
warnings.filterwarnings('ignore')
from tabulate import tabulate


def waitforEnter(fstop=False):
    if fstop:
        if sys.version_info[0] == 2:
            raw_input("Press ENTER to continue.")
        else:
            input("Press ENTER to continue.")

def plotFeatures(features,oClass,f1index=0,f2index=1):
    nObs,nFea=features.shape
    cObs,cFea=oClass.shape
    colors = ['g', 'r', 'b', 'y']  # g: green, r: red, b: blue, y: yellow
    for i in range(nObs):
        if i < cObs: 
            plt.plot(features[i,f1index],features[i,f2index],'o'+colors[int(oClass[i])])

    plt.show()
    plt.close()

def distance(c,p):
    return(np.sqrt(np.sum(np.square(p-c))))

from sklearn import metrics
from sklearn.metrics import ConfusionMatrixDisplay
import matplotlib.pyplot as plt

def printAdvancedStats(tp, tn, fp, fn):
    accuracy = (tp + tn) / (tp + tn + fp + fn)
    precision = tp / (tp + fp)
    recall = tp / (tp + fn)
    f1_score = 2 * (recall * precision) / (recall + precision) if (recall + precision) != 0 else 0

    table = [["Metric", "Value"],
             ["Accuracy", "{:.2%}".format(accuracy)],
             ["Precision", "{:.2%}".format(precision)],
             ["Recall", "{:.2%}".format(recall)],
             ["F1-Score", "{:.2f}".format(f1_score)]]

    specificity = tn / (tn + fp)
    sensitivity = recall
    false_positive_rate = fp / (fp + tn)
    false_negative_rate = fn / (fn + tp)

    additional_metrics_table = [
        ["Specificity", "{:.2%}".format(specificity)],
        ["Sensitivity (True Positive Rate)", "{:.2%}".format(sensitivity)],
        ["False Positive Rate", "{:.2%}".format(false_positive_rate)],
        ["False Negative Rate", "{:.2%}".format(false_negative_rate)]
    ]

    print(tabulate(table, tablefmt="fancy_grid"))
    print("\nAdditional Metrics:")
    print(tabulate(additional_metrics_table, tablefmt="fancy_grid"))


########### Main Code #############
Classes={0:'Client',1:"Attacker"}
#plt.ion()
nfig=1


#Load data from text file
NormalFeatures_c1=np.loadtxt("New/Features/GoodUser1F.dat")       # normal user
NormalFeatures_c2=np.loadtxt("New/Features/GoodUser2F.dat")       # normal user
NormalFeatures_test=np.loadtxt("New/Features/GoodUserTestF.dat")       # normal user
NormalFeatures_botDumb=np.loadtxt("New/Features/BotDumbF.dat")     # isolated bot dumb
NormalFeatures_botInter=np.loadtxt("New/Features/BotInterF.dat")     # isolated bot intermedium
NormalFeatures_botSmart=np.loadtxt("New/Features/BotSmartF.dat")     # isolated bot smart
NormalFeatures_botDumbMix=np.loadtxt("New/Features/GoodBotDumbF.dat")     # good traffic + bot dumb
NormalFeatures_botInterMix=np.loadtxt("New/Features/GoodBotInterF.dat")     # good traffic + bot intermedium
NormalFeatures_botSmartMix=np.loadtxt("New/Features/GoodBotSmartF.dat")     # good traffic + bot smart



oClass_user=np.ones((len(NormalFeatures_c1)+len(NormalFeatures_c2),1))*0
oClass_user_test=np.ones((len(NormalFeatures_test),1))*0


######################################################################
# oClass_bot=np.ones((len(NormalFeatures_botDumb),1))*1
# oClass_bot=np.ones((len(NormalFeatures_botInter),1))*1
# oClass_bot=np.ones((len(NormalFeatures_botSmart),1))*1
# oClass_bot=np.ones((len(NormalFeatures_botDumbMix),1))*1
# oClass_bot=np.ones((len(NormalFeatures_botInterMix),1))*1
# oClass_bot=np.ones((len(NormalFeatures_botSmartMix),1))*1

# oClass_bot=np.ones((len(NormalFeatures_botDumb) + len(NormalFeatures_botInter) + len(NormalFeatures_botSmart),1))*1
oClass_bot=np.ones((len(NormalFeatures_botDumbMix) + len(NormalFeatures_botInterMix) + len(NormalFeatures_botSmartMix),1))*1


# features=np.vstack((NormalFeatures_c1,NormalFeatures_c2,  NormalFeatures_botDumb))
# features=np.vstack((NormalFeatures_c1,NormalFeatures_c2,  NormalFeatures_botInter))
# features=np.vstack((NormalFeatures_c1,NormalFeatures_c2,  NormalFeatures_botSmart))
# features=np.vstack((NormalFeatures_c1,NormalFeatures_c2,  NormalFeatures_botDumbMix))
# features=np.vstack((NormalFeatures_c1,NormalFeatures_c2,  NormalFeatures_botInterMix))
# features=np.vstack((NormalFeatures_c1,NormalFeatures_c2,  NormalFeatures_botSmartMix))

# features=np.vstack((NormalFeatures_c1,NormalFeatures_c2, NormalFeatures_botDumb, NormalFeatures_botInter, NormalFeatures_botSmart))
features=np.vstack((NormalFeatures_c1,NormalFeatures_c2, NormalFeatures_botDumbMix, NormalFeatures_botInterMix, NormalFeatures_botSmartMix))

######################################################################

oClass=np.vstack((oClass_user,oClass_bot))
print('Train Stats Features Size:',features.shape)
print('Classes Size: ', oClass.shape)

# Plot features
plt.figure(1)
plotFeatures(features,oClass,0,3)               #mean and std deviation of up packets
# Plot features
plt.figure(2)                                   # mean up bytes vs mean down bytes
plotFeatures(features,oClass,12,14) #0,27
#Plot features
plt.figure(3)                                   # mean down bytes vs 98 percentile of down bytes
plotFeatures(features,oClass,23,27) #0,27


########### Silence Features #############

SilenceFeatures_c1=np.loadtxt("New/Features/GoodUser1SF.dat")       # normal user
SilenceFeatures_c2=np.loadtxt("New/Features/GoodUser2SF.dat")       # normal user
SilenceFeatures_test=np.loadtxt("New/Features/GoodUserTestSF.dat")       # normal user
SilenceFeatures_botDumb=np.loadtxt("New/Features/BotDumbSF.dat")     # isolated bot dumb
SilenceFeatures_botInter=np.loadtxt("New/Features/BotInterSF.dat")     # isolated bot intermedium
SilenceFeatures_botSmart=np.loadtxt("New/Features/BotSmartSF.dat")     # isolated bot smart
SilenceFeatures_botDumbMix=np.loadtxt("New/Features/GoodBotDumbSF.dat")     # good traffic + bot dumb
SilenceFeatures_botInterMix=np.loadtxt("New/Features/GoodBotInterSF.dat")     # good traffic + bot intermedium
SilenceFeatures_botSmartMix=np.loadtxt("New/Features/GoodBotSmartSF.dat")     # good traffic + bot smart


######################################################################
# featuresSilence=np.vstack((SilenceFeatures_c1,SilenceFeatures_c2,  SilenceFeatures_botDumb))
# featuresSilence=np.vstack((SilenceFeatures_c1,SilenceFeatures_c2,  SilenceFeatures_botInter))
# featuresSilence=np.vstack((SilenceFeatures_c1,SilenceFeatures_c2,  SilenceFeatures_botSmart))
# featuresSilence=np.vstack((SilenceFeatures_c1,SilenceFeatures_c2,  SilenceFeatures_botDumbMix))
# featuresSilence=np.vstack((SilenceFeatures_c1,SilenceFeatures_c2,  SilenceFeatures_botInterMix))
# featuresSilence=np.vstack((SilenceFeatures_c1,SilenceFeatures_c2,  SilenceFeatures_botSmartMix))

# featuresSilence=np.vstack((SilenceFeatures_c1,SilenceFeatures_c2,  SilenceFeatures_botDumb, SilenceFeatures_botInter, SilenceFeatures_botSmart))
featuresSilence=np.vstack((SilenceFeatures_c1,SilenceFeatures_c2,  SilenceFeatures_botDumbMix, SilenceFeatures_botInterMix, SilenceFeatures_botSmartMix))

######################################################################

oClass=np.vstack((oClass_user,oClass_bot))
print('Train Silence Features Size:',featuresSilence.shape)
print('Classes Size: ', oClass.shape)

plt.figure(2)                                   # size silence up packets vs std  up packets
plotFeatures(features,oClass,0,3) #0,27
#Plot features
plt.figure(3)                                   # size activity up packets and std deviation up packets 
plotFeatures(features,oClass,3,5) #0,27


#############----Feature Training----#############

#   train features of normal behavior
#   trainCUser -> good behavior only
trainFUser=np.vstack((NormalFeatures_c1,NormalFeatures_c2))
trainFSUser=np.vstack((SilenceFeatures_c1,SilenceFeatures_c2))
mixTrainUser=np.hstack((trainFUser,trainFSUser))
trainCUser=oClass_user

#   test features with a clients good behavior
#   testCUser -> good behavior for anomaly detection
testFUser=NormalFeatures_test
testFSUser=SilenceFeatures_test
mixTestUser=np.hstack((testFUser,testFSUser))
testCUser=oClass_user_test

################################################

#   test features with attacker behavior
#   testCBot -> bad behavior for anomaly detection
#---#
# testFBot=NormalFeatures_botDumb
# testFSBot=SilenceFeatures_botDumb
#---#
# testFBot=NormalFeatures_botInter
# testFSBot=SilenceFeatures_botInter
#---#
# testFBot=NormalFeatures_botSmart
# testFSBot=SilenceFeatures_botSmart
#---#
# testFBot=NormalFeatures_botDumbMix
# testFSBot=SilenceFeatures_botDumbMix
#---#
# testFBot=NormalFeatures_botInterMix
# testFSBot=SilenceFeatures_botInterMix
#---#
# testFBot=NormalFeatures_botSmartMix
# testFSBot=SilenceFeatures_botSmartMix
#---#
# testFBot=np.vstack((NormalFeatures_botDumb,NormalFeatures_botInter, NormalFeatures_botSmart))
# testFSBot=np.vstack((SilenceFeatures_botDumb,SilenceFeatures_botInter, SilenceFeatures_botSmart))
#---#
testFBot=np.vstack((NormalFeatures_botDumbMix,NormalFeatures_botInterMix, NormalFeatures_botSmartMix))
testFSBot=np.vstack((SilenceFeatures_botDumbMix,SilenceFeatures_botInterMix, SilenceFeatures_botSmartMix))
#---#


mixTestBot=np.hstack((testFBot,testFSBot))
testCBot=oClass_bot


################################################



#############----Feature Normalization----#############
from sklearn.preprocessing import MaxAbsScaler

#Without silences
# scaler = MaxAbsScaler().fit(trainFUser)

# trainFeaturesUser=scaler.transform(trainFUser)
# testFeaturesUser=scaler.transform(testFUser)
# testFeaturesBot=scaler.transform(testFBot)

#With silences

scaler = MaxAbsScaler().fit(mixTrainUser)

trainFeaturesUser=scaler.transform(mixTrainUser)
testFeaturesUser=scaler.transform(mixTestUser)
testFeaturesBot=scaler.transform(mixTestBot)



#############----PCA----#############
from sklearn.decomposition import PCA

pca = PCA(n_components=28, svd_solver='full')

# 
train_pca=pca.fit(trainFeaturesUser)
trainPCA = train_pca.transform(trainFeaturesUser)

#
testPCA_User = train_pca.transform(testFeaturesUser)
testPCA_Bot = train_pca.transform(testFeaturesBot)

cumulative_variance_ratio = np.cumsum(train_pca.explained_variance_ratio_)
print("Cumulative explained variance ratio:", cumulative_variance_ratio)

print("Explained variance ratio:", train_pca.explained_variance_ratio_)



#############----Anomaly Detection based on centroids distances----#############
from sklearn.preprocessing import MaxAbsScaler

centroids={}
pClass=(trainCUser==0).flatten()
centroids.update({0:np.mean(trainFeaturesUser[pClass,:],axis=0)})
print('All Features Centroids:\n',centroids)


tp = 0 #True Positive
tn = 0 #True Negative
fp = 0 #False Positive
fn = 0 #False Negative

AnomalyThreshold=1.2
print('\n-- Anomaly Detection based on Centroids Distances --')
nObsTest,nFea=testFeaturesBot.shape
for i in range(nObsTest):
    x=testFeaturesBot[i]
    dists=[distance(x,centroids[0])]
    if min(dists)>AnomalyThreshold:
        result="Anomaly"
        #True Positive
        tp += 1
    else:
        result="OK"
        #False Negative
        fn += 1
    # print('Obs: {:2} ({}): Normalized Distances to Centroids: [{:.4f}] -> Result -> {}'.format(i,Classes[testCBot[i][0]],*dists,result))

nObsTest,nFea=testFeaturesUser.shape
for i in range(nObsTest):
    x=testFeaturesUser[i]
    dists=[distance(x,centroids[0])]
    if min(dists)>AnomalyThreshold:
        result="Anomaly"
        #False Positive
        fp += 1
    else:
        result="OK"
        #True Negative
        tn += 1
    # print('Obs: {:2} ({}): Normalized Distances to Centroids: [{:.4f}] -> Result -> {}'.format(i,Classes[testCUser[i][0]],*dists,result))

printAdvancedStats(tp, tn, fp, fn)


#############----Anomaly Detection based on centroids distances (PCA Features)----#############
from sklearn.preprocessing import MaxAbsScaler

centroids={}
pClass=(trainCUser==0).flatten() 
centroids.update({0:np.mean(trainPCA[pClass,:],axis=0)})


tp = 0 #True Positive
tn = 0 #True Negative
fp = 0 #False Positive
fn = 0 #False Negative

AnomalyThreshold=1.2
print('\n-- Anomaly Detection based on Centroids Distances (PCA Features)--')
nObsTest,nFea=testPCA_Bot.shape

for i in range(nObsTest):
    x=testPCA_Bot[i]
    dists=[distance(x,centroids[0])]
    if min(dists)>AnomalyThreshold:
        result="Anomaly"
        #True Positive
        tp += 1
    else:
        result="OK"
        #False Negative
        fn += 1
    # print('Obs: {:2} ({}): Normalized Distances to Centroids: [{:.4f}] -> Result -> {}'.format(i,Classes[testCBot[i][0]],*dists,result))

nObsTest,nFea=testPCA_User.shape
for i in range(nObsTest):
    x=testPCA_User[i]
    dists=[distance(x,centroids[0])]
    if min(dists)>AnomalyThreshold:
        result="Anomaly"
        #False Positive
        fp += 1
    else:
        result="OK"
        #True Negative
        tn += 1
    # print('Obs: {:2} ({}): Normalized Distances to Centroids: [{:.4f}] -> Result -> {}'.format(i,Classes[testCUser[i][0]],*dists,result))

printAdvancedStats(tp, tn, fp, fn)


#############----Anomaly Detection based on One Class Support Vector Machines (PCA Features)---#############
from sklearn import svm

print('\n-- Anomaly Detection based on One Class Support Vector Machines (PCA Features) --')
ocsvm = svm.OneClassSVM(gamma='scale',kernel='linear').fit(trainPCA)  
rbf_ocsvm = svm.OneClassSVM(gamma='scale',kernel='rbf').fit(trainPCA)  
poly_ocsvm = svm. OneClassSVM(gamma='scale',kernel='poly',degree=2).fit(trainPCA)  

tpL, tnL, fpL, fnL = 0, 0, 0, 0
tpRBF, tnRBF, fpRBF, fnRBF = 0, 0, 0, 0
tpP, tnP, fpP, fnP = 0, 0, 0, 0


L1=ocsvm.predict(testPCA_Bot)
L2=rbf_ocsvm.predict(testPCA_Bot)
L3=poly_ocsvm.predict(testPCA_Bot)

AnomResults={-1:"Anomaly",1:"OK"}

nObsTest,nFea=testFeaturesBot.shape
for i in range(nObsTest):    
    #Linear
    if AnomResults[L1[i]] == "Anomaly":
        tpL += 1
    else:
        fnL += 1
    #RBF
    if AnomResults[L2[i]] == "Anomaly":
        tpRBF += 1
    else:
        fnRBF += 1
    #Poly
    if AnomResults[L3[i]] == "Anomaly":
        tpP += 1
    else:
        fnP += 1

    # print('Obs: {:2} ({:<8}): Kernel Linear->{:<10} | Kernel RBF->{:<10} | Kernel Poly->{:<10}'.format(i,Classes[testCBot[i][0]],AnomResults[L1[i]],AnomResults[L2[i]],AnomResults[L3[i]]))


L1=ocsvm.predict(testPCA_User)
L2=rbf_ocsvm.predict(testPCA_User)
L3=poly_ocsvm.predict(testPCA_User)
testFeaturesUser
nObsTest,nFea=testFeaturesUser.shape
for i in range(nObsTest):    
    #Linear
    if AnomResults[L1[i]] == "Anomaly":
        fpL += 1
    else:
        tnL += 1
    #RBF
    if AnomResults[L2[i]] == "Anomaly":
        fpRBF += 1
    else:
        tnRBF += 1
    #Poly
    if AnomResults[L3[i]] == "Anomaly":
        fpP += 1
    else:
        tnP += 1

    # print('Obs: {:2} ({:<8}): Kernel Linear->{:<10} | Kernel RBF->{:<10} | Kernel Poly->{:<10}'.format(i,Classes[testCUser[i][0]],AnomResults[L1[i]],AnomResults[L2[i]],AnomResults[L3[i]]))


print("\nKernel Linear Statistics")
printAdvancedStats(tpL, tnL, fpL, fnL)
print("\nKernel RBF Statistics")
printAdvancedStats(tpRBF, tnRBF, fpRBF, fnRBF)
print("\nKernel Poly Statistics")
printAdvancedStats(tpP, tnP, fpP, fnP)



#############----Anomaly Detection based on One Class Support Vector Machines----#############
from sklearn import svm

print('\n-- Anomaly Detection based on One Class Support Vector Machines --')
ocsvm = svm.OneClassSVM(gamma='scale',kernel='linear').fit(trainFeaturesUser)  
rbf_ocsvm = svm.OneClassSVM(gamma='scale',kernel='rbf').fit(trainFeaturesUser)  
poly_ocsvm = svm. OneClassSVM(gamma='scale',kernel='poly',degree=2).fit(trainFeaturesUser)  

tpL, tnL, fpL, fnL = 0, 0, 0, 0
tpRBF, tnRBF, fpRBF, fnRBF = 0, 0, 0, 0
tpP, tnP, fpP, fnP = 0, 0, 0, 0


L1=ocsvm.predict(testFeaturesBot)
L2=rbf_ocsvm.predict(testFeaturesBot)
L3=poly_ocsvm.predict(testFeaturesBot)

AnomResults={-1:"Anomaly",1:"OK"}

nObsTest,nFea=testPCA_Bot.shape
for i in range(nObsTest):    
    #Linear
    if AnomResults[L1[i]] == "Anomaly":
        tpL += 1
    else:
        fnL += 1
    #RBF
    if AnomResults[L2[i]] == "Anomaly":
        tpRBF += 1
    else:
        fnRBF += 1
    #Poly
    if AnomResults[L3[i]] == "Anomaly":
        tpP += 1
    else:
        fnP += 1

    # print('Obs: {:2} ({:<8}): Kernel Linear->{:<10} | Kernel RBF->{:<10} | Kernel Poly->{:<10}'.format(i,Classes[testCBot[i][0]],AnomResults[L1[i]],AnomResults[L2[i]],AnomResults[L3[i]]))


L1=ocsvm.predict(testFeaturesUser)
L2=rbf_ocsvm.predict(testFeaturesUser)
L3=poly_ocsvm.predict(testFeaturesUser)

nObsTest,nFea=testFeaturesUser.shape
for i in range(nObsTest):    
    #Linear
    if AnomResults[L1[i]] == "Anomaly":
        fpL += 1
    else:
        tnL += 1
    #RBF
    if AnomResults[L2[i]] == "Anomaly":
        fpRBF += 1
    else:
        tnRBF += 1
    #Poly
    if AnomResults[L3[i]] == "Anomaly":
        fpP += 1
    else:
        tnP += 1


    # print('Obs: {:2} ({:<8}): Kernel Linear->{:<10} | Kernel RBF->{:<10} | Kernel Poly->{:<10}'.format(i,Classes[testCUser[i][0]],AnomResults[L1[i]],AnomResults[L2[i]],AnomResults[L3[i]]))


print("\nKernel Linear Statistics")
printAdvancedStats(tpL, tnL, fpL, fnL)
print("\nKernel RBF Statistics")
printAdvancedStats(tpRBF, tnRBF, fpRBF, fnRBF)
print("\nKernel Poly Statistics")
printAdvancedStats(tpP, tnP, fpP, fnP)



# ######################---- K-means (PCA features)----######################
# print("############################################")
# print("K-Means Clustering Statistics (PCA features)")
# # K-Means with PCA features
# kmeans = KMeans(n_clusters=2, random_state=0).fit(trainPCA)
# centroids = kmeans.cluster_centers_

# # Define a function to calculate distance to the nearest centroid
# def distance_to_centroid(point, centroids):
#     return np.min([np.linalg.norm(point - c) for c in centroids])

# distances = [distance_to_centroid(point, centroids) for point in trainPCA]

# # Set your threshold for anomaly detection
# kmeans_threshold = np.percentile(distances, 95) # Adjust this value as needed

# # Testing with PCA features
# tp, tn, fp, fn = 0, 0, 0, 0
# for point in testPCA_Bot:
#     if distance_to_centroid(point, centroids) > kmeans_threshold:
#         tp += 1
#     else:
#         fn += 1

# for point in testPCA_User:
#     if distance_to_centroid(point, centroids) > kmeans_threshold:
#         fp += 1
#     else:
#         tn += 1


# threshold = np.percentile(distances, 95)  # for example, set threshold at the 95th percentile
# print("Threshold for K-Means:", threshold)


# AnomResults = {True: "Anomaly", False: "OK"}

# # Testing the model with testPCA_Bot
# print("\nResults for TestPCA_Bot:")
# for i, test_point in enumerate(testPCA_Bot):
#     distance = distance_to_centroid(test_point, centroids)
#     is_anomaly = distance > threshold
#     print('Obs: {:2} ({:<8}): {}'.format(i, Classes[testCBot[i][0]], AnomResults[is_anomaly]))

# # Testing the model with testPCA_User
# print("\nResults for TestPCA_User:")
# for i, test_point in enumerate(testPCA_User):
#     distance = distance_to_centroid(test_point, centroids)
#     is_anomaly = distance > threshold
#     print('Obs: {:2} ({:<8}): {}'.format(i, Classes[testCUser[i][0]], AnomResults[is_anomaly]))


# print("\nK-Means Clustering Statistics (PCA Features)")
# printAdvancedStats(tp, tn, fp, fn)


######################----K means----######################

print("############################################")
print("K-Means Clustering Statistics")
# K-Means with PCA features
kmeans = KMeans(n_clusters=2, random_state=0).fit(trainFeaturesUser)
centroids = kmeans.cluster_centers_

# Define a function to calculate distance to the nearest centroid
def distance_to_centroid(point, centroids):
    return np.min([np.linalg.norm(point - c) for c in centroids])

distances = [distance_to_centroid(point, centroids) for point in trainFeaturesUser]

# Set your threshold for anomaly detection
kmeans_threshold = np.percentile(distances, 95) # Adjust this value as needed

# Testing with PCA features
tp, tn, fp, fn = 0, 0, 0, 0
for point in testFeaturesBot:
    if distance_to_centroid(point, centroids) > kmeans_threshold:
        tp += 1
    else:
        fn += 1

for point in testFeaturesUser:
    if distance_to_centroid(point, centroids) > kmeans_threshold:
        fp += 1
    else:
        tn += 1

threshold = np.percentile(distances, 95)  # for example, set threshold at the 95th percentile
print("Threshold for K-Means:", threshold)


AnomResults = {True: "Anomaly", False: "OK"}

# Testing the model with testPCA_Bot
print("\nResults for testFeatureBot:")
for i, test_point in enumerate(testFeaturesBot):
    distance = distance_to_centroid(test_point, centroids)
    is_anomaly = distance > threshold
    print('Obs: {:2} ({:<8}): {}'.format(i, Classes[testCBot[i][0]], AnomResults[is_anomaly]))

# Testing the model with testPCA_User
print("\nResults for testFeatureUser:")
for i, test_point in enumerate(testFeaturesUser):
    distance = distance_to_centroid(test_point, centroids)
    is_anomaly = distance > threshold
    print('Obs: {:2} ({:<8}): {}'.format(i, Classes[testCUser[i][0]], AnomResults[is_anomaly]))


print("\nK-Means Clustering Statistics")
printAdvancedStats(tp, tn, fp, fn)


######################----ISOLATION FOREST (PCA features)----######################

print("############################################")
print("Isolation Forest(PCA Features)")
from sklearn.ensemble import IsolationForest

# Isolation Forest with PCA features
iso_forest = IsolationForest(random_state=0).fit(trainPCA)

# Testing with PCA features
tp, tn, fp, fn = 0, 0, 0, 0
iso_forest_labels_bot = iso_forest.predict(testPCA_Bot)
iso_forest_labels_user = iso_forest.predict(testPCA_User)



# Counting TP, TN, FP, FN
tp = np.sum(iso_forest_labels_bot == -1)
fn = len(iso_forest_labels_bot) - tp
fp = np.sum(iso_forest_labels_user == -1)
tn = len(iso_forest_labels_user) - fp


# print("\nIsolation Forest Statistics (PCA Features)")
printAdvancedStats(tp, tn, fp, fn)


######################----ISOLATION FOREST----######################

print("############################################")
print("Isolation Forest")

from sklearn.ensemble import IsolationForest

# Isolation Forest with PCA features
iso_forest = IsolationForest(random_state=0).fit(trainFeaturesUser)

# Testing with PCA features
tp, tn, fp, fn = 0, 0, 0, 0
iso_forest_labels_bot = iso_forest.predict(testFeaturesBot)
iso_forest_labels_user = iso_forest.predict(testFeaturesUser)

# Counting TP, TN, FP, FN
tp = np.sum(iso_forest_labels_bot == -1)
fn = len(iso_forest_labels_bot) - tp
fp = np.sum(iso_forest_labels_user == -1)
tn = len(iso_forest_labels_user) - fp

# print("\nIsolation Forest Statistics (PCA Features)")
printAdvancedStats(tp, tn, fp, fn)

