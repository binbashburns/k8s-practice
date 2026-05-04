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

### Overall feedback for lightning lab:
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

