# KodeKloud CKA Practice
## Lightning Lab 1

### Question 1 of 7

Weight: 15
Upgrade the current version of kubernetes from 1.34.0 to 1.35.0 exactly using the kubeadm utility. Make sure that the upgrade is carried out one node at a time starting with the controlplane node. To minimize downtime, the deployment gold-nginx should be rescheduled on an alternate node before upgrading each node.

Upgrade controlplane node first and drain node node01 before upgrading it. Pods for gold-nginx should run on the controlplane node subsequently.

Cluster Upgraded?
pods 'gold-nginx' running on controlplane?

```
# followed guide here: https://v1-35.docs.kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/
controlplane ~ ➜  k get nodes
NAME           STATUS   ROLES           AGE   VERSION
controlplane   Ready    control-plane   98m   v1.35.0
node01         Ready    <none>          97m   v1.35.0

# edited vim /etc/apt/sources.list.d/kubernetes.list
# sudo apt update
# sudo apt-cache madison kubeadm
# sudo apt-mark unhold kubeadm && sudo apt-get update && sudo apt-get install -y kubeadm='1.35.0-1.1' && sudo apt-mark hold kubeadm
# kubeadm version
# sudo kubeadm upgrade plan
# sudo kubeadm upgrade apply v1.35.0
# sudo apt-mark unhold kubelet kubectl && sudo apt-get update && sudo apt-get install -y kubelet='1.35.0-1.1' kubectl='1.35.0-1.1' && sudo apt-mark hold kubelet kubectl
# sudo systemctl daemon-reload
# ....etc
```

### Question 2 of 7

Weight: 15
Print the names of all deployments in the admin2406 namespace in the following format:

DEPLOYMENT   CONTAINER_IMAGE   READY_REPLICAS   NAMESPACE

<deployment name>   <container image used>   <ready replica count>   <Namespace>
. The data should be sorted by the increasing order of the deployment name.


Example:

DEPLOYMENT   CONTAINER_IMAGE   READY_REPLICAS   NAMESPACE
deploy0   nginx:alpine   1   admin2406
Write the result to the file /opt/admin2406_data.


Task completed?

Didn't attempt, couldn't figure out JSONPATH syntax

### Question 3 of 7

Weight: 8
A kubeconfig file called admin.kubeconfig has been created in /root/CKA. There is something wrong with the configuration. Troubleshoot and fix it.


Fix /root/CKA/admin.kubeconfig

```
# changed
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ...
    server: https://controlplane:1234

# to
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ...
    server: https://controlplane:6443
```

### Question 4 of 7

Weight: 12
Create a new deployment called nginx-deploy, with image nginx:1.16 and 1 replica.
Next, upgrade the deployment to version 1.17 using rolling update and add the annotation message
Updated nginx image to 1.17.

Image: nginx:1.16

Task: Upgrade the version of the deployment to 1:17

```
k create deploy nginx-deploy --image=nginx:1.16 --replicas=1 -o yaml --dry-run=client > 4.yaml
k apply -f 4.yaml
k set image deploy/nginx-deploy nginx=nginx:1.17
controlplane ~ ➜  k annotate deploy/nginx-deploy message="Updated nginx image to 1.17"
```

### Question 5 of 7

Weight: 20
A new deployment called alpha-mysql has been deployed in the alpha namespace. However, the pods are not running. Troubleshoot and fix the issue. The deployment should make use of the persistent volume alpha-pv to be mounted at /var/lib/mysql and should use the environment variable MYSQL_ALLOW_EMPTY_PASSWORD=1 to make use of an empty root password.

Important: Do not alter the persistent volume.

Troubleshoot and fix the issues

```
for this one, saw mismatches in pvc and pv selectors and volume size
```

### Question 6 of 7

Weight: 10
Take the backup of ETCD at the location /opt/etcd-backup.db on the controlplane node.

Troubleshoot and fix the issues

Never figured this one out

### Question 7 of 7

Weight: 20
Create a pod called secret-1401 in the admin1401 namespace using the busybox image. The container within the pod should be called secret-admin and should sleep for 4800 seconds.

The container should mount a read-only secret volume called secret-volume at the path /etc/secret-volume. The secret being mounted has already been created for you and is called dotfile-secret.


Pod created correctly?

Nearly perfect solution here: https://kubernetes.io/docs/concepts/configuration/secret/
```
apiVersion: v1
kind: Pod
metadata:
  name: secret-1401
  namespace: admin1401
spec:
  volumes:
    - name: secret-volume
      secret:
        secretName: dotfile-secret
  containers:
    - name: secret-admin
      image: busybox
      command: ['sh', '-c', 'sleep 4800']
      volumeMounts:
        - name: secret-volume
          readOnly: true
          mountPath: "/etc/secret-volume"
```

### Overall feedback
#### Q.1
Pass

#### Q.2

Task
Print the names of all deployments in the admin2406 namespace in the following format:

DEPLOYMENT   CONTAINER_IMAGE   READY_REPLICAS   NAMESPACE

<deployment name>   <container image used>   <ready replica count>   <Namespace>
. The data should be sorted by the increasing order of the deployment name.

Example:

DEPLOYMENT   CONTAINER_IMAGE   READY_REPLICAS   NAMESPACE
deploy0   nginx:alpine   1   admin2406
Write the result to the file /opt/admin2406_data.


Solution
Run the below command to get the correct output:

kubectl -n admin2406 get deployment -o custom-columns=DEPLOYMENT:.metadata.name,CONTAINER_IMAGE:.spec.template.spec.containers[].image,READY_REPLICAS:.status.readyReplicas,NAMESPACE:.metadata.namespace --sort-by=.metadata.name > /opt/admin2406_data

#### Q. 3
Pass

#### Q. 4
Pass

#### Q. 5
Pass

#### Q. 6
Task
Take the backup of ETCD at the location /opt/etcd-backup.db on the controlplane node.

Solution
Take a help of command etcdctl snapshot save --help options.

export ETCDCTL_API=3
etcdctl snapshot save --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key --endpoints=127.0.0.1:2379 /opt/etcd-backup.db

(i couldn't find this in documentation anywhere)

### Q. 7
Pass

---

## Mock Exam 1
### Overall feedback
Your score
84%

Pass Percentage - 74%

#### Q. 1
Task
Create a Pod mc-pod in the mc-namespace namespace with three containers. The first container should be named mc-pod-1, run the nginx:1-alpine image, and set an environment variable NODE_NAME to the node name. The second container should be named mc-pod-2, run the busybox:1 image, and continuously log the output of the date command to the file /var/log/shared/date.log every second. The third container should have the name mc-pod-3, run the image busybox:1, and print the contents of the date.log file generated by the second container to stdout. Use a shared, non-persistent volume.

Solution
Ensure the shared volume is not persisted across restarts.

Here’s the YAML for the Pod:

apiVersion: v1
kind: Pod
metadata:
  name: mc-pod
  namespace: mc-namespace
spec:
  containers:
    - name: mc-pod-1
      image: nginx:1-alpine
      env:
        - name: NODE_NAME
          valueFrom:
            fieldRef:
              fieldPath: spec.nodeName
    - name: mc-pod-2
      image: busybox:1
      volumeMounts:
        - name: shared-volume
          mountPath: /var/log/shared
      command:
        - "sh"
        - "-c"
        - "while true; do date >> /var/log/shared/date.log; sleep 1; done"
    - name: mc-pod-3
      image: busybox:1
      command:
        - "sh"
        - "-c"
        - "tail -f /var/log/shared/date.log"
      volumeMounts:
        - name: shared-volume
          mountPath: /var/log/shared
  volumes:
    - name: shared-volume
      emptyDir: {}

Details
Is the pod environment variable correctly set?

Does the Sidecar display logs?

#### Q. 2

Task
This question needs to be solved on node node01. To access the node using SSH, use the credentials below:

username: bob
password: caleston123

As an administrator, you need to prepare node01 to install kubernetes. One of the steps is installing a container runtime. Install the cri-docker_0.3.16.3-0.debian.deb package located in /root and ensure that the cri-docker service is running and enabled to start on boot.

PASS

#### Q. 3

Task
On controlplane node, identify all CRDs related to VerticalPodAutoscaler and save their names into the file /root/vpa-crds.txt.

PASS

#### Q. 4

Task
Create a service named messaging-service to expose the messaging pod within the cluster on port 6379. The messaging pod is running in the default namespace.

Use imperative commands.

PASS

#### Q. 5

Task
Create a deployment named hr-web-app using the image kodekloud/webapp-color with 2 replicas.

PASS

#### Q. 6

Task
A new application orange is deployed. There is something wrong with it. Identify and fix the issue.

#### Q. 7

Task
Expose the hr-web-app created in the previous task as a service named hr-web-app-service, accessible on port 30082 on the nodes of the cluster.

The web application listens on port 8080.

PASS

#### Q. 8

Task
Create a Persistent Volume with the given specification: -

Volume name: pv-analytics

Storage: 100Mi

Access mode: ReadWriteMany

Host path: /pv/data-analytics

PASS

#### Q. 9

Task
Create a Horizontal Pod Autoscaler (HPA) with name webapp-hpa for the deployment named kkapp-deploy in the default namespace with the webapp-hpa.yaml file located under the root folder.
Ensure that the HPA scales the deployment based on CPU utilization, maintaining an average CPU usage of 50% across all pods.
Configure the HPA to cautiously scale down pods by setting a stabilization window of 300 seconds to prevent rapid fluctuations in pod count.

Note: The kkapp-deploy deployment is created for backend; you can check in the terminal.

PASS

#### Q. 10

Task
Deploy a Vertical Pod Autoscaler (VPA) with name analytics-vpa for the deployment named analytics-deployment in the default namespace.
The VPA should automatically adjust the CPU and memory requests of the pods to optimize resource utilization. Ensure that the VPA operates in Recreate mode, allowing it to evict and recreate pods with updated resource requests as needed.

PASS

#### Q. 11

Task
Create a Kubernetes Gateway resource with the following specifications:

Name: web-gateway
Namespace: nginx-gateway
Gateway Class Name: nginx
Listeners:
Protocol: HTTP
Port: 80
Name: http
Q. 12

Task
One co-worker deployed a podinfo helm chart kk-mock1 in the kk-ns namespace on the cluster. A new update is pushed to the helm chart, and the team wants you to update the helm repository to fetch the new changes.


After updating the helm chart, upgrade the helm chart version to 6.11.2.


Solution
In this task, we will use the kubectl and helm commands. Here are the steps: -



use the helm ls command to list all the releases installed using Helm in the Kubernetes cluster.

helm ls -A



Here -A or --all-namespaces option lists all the releases of all the namespaces.



Identify the namespace where the resources get deployed.


Use the helm repo ls command to list the helm repositories.
helm repo ls 



Now, update the helm repository with the following command: -

helm repo update kk-mock1 -n kk-ns



The above command updates the local cache of available charts from the configured chart repositories.



The helm search command searches for all the available charts in a specific Helm chart repository. In our case, it's the podinfo helm chart.
helm search repo kk-mock1/podinfo -n kk-ns -l | head -n30



The -l or --versions option is used to display information about all available chart versions.



Upgrade the helm chart to 6.11.2: -

helm upgrade kk-mock1 kk-mock1/podinfo -n kk-ns --version=6.11.2



After upgrading the chart version, you can verify it with the following command: -

helm ls -n kk-ns



Look under the CHART column for the chart version.



Details
Is the deployment running?

Is the chart version upgraded?

---

## Mock Exam 2
### Overall feedback
Your score
84%

Pass Percentage - 74%

#### Q. 1