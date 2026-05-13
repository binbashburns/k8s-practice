// Questions for topic 'cka-csr-rbac'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_CKA_CSR_RBAC = [
  {
    id: 'cka-csr-1',
    topic: 'cka-csr-rbac',
    difficulty: 'hard',
    title: 'Create CSR john-developer, approve it, and grant Pod CRUD in development namespace',
    scenario: 'Create a user <code>john</code>. Use the existing key/csr at <code>/root/CKA/john.key</code> and <code>/root/CKA/john.csr</code>. Create a CSR named <code>john-developer</code> with signerName <code>kubernetes.io/kube-apiserver-client</code>, approve it, then create a Role <code>developer</code> granting <strong>create, list, get, update, delete</strong> on pods in the <code>development</code> namespace, and bind it to john.',
    hint: {
      url: 'https://kubernetes.io/docs/reference/access-authn-authz/certificate-signing-requests/',
      path: 'Reference → Access, Authn, Authz → Certificate Signing Requests',
      tip: 'The "request" field is the .csr file contents base64-encoded ON ONE LINE. Use: cat /root/CKA/john.csr | base64 -w 0. Then: kubectl certificate approve john-developer. Then: kubectl create role/rolebinding imperatively.'
    },
    answer: {
      explanation: '<span class="highlight">Three steps, exam-fast:</span> base64-encode the CSR (<code>-w 0</code> = no line wrap), apply the CSR YAML, approve, then create role + binding imperatively.',
      yaml: `# 1. Base64-encode the CSR ON ONE LINE
REQ=$(cat /root/CKA/john.csr | base64 -w 0)

# 2. Create the CSR resource
cat <<EOF | kubectl apply -f -
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: john-developer
spec:
  signerName: kubernetes.io/kube-apiserver-client
  request: $REQ
  usages:
  - digital signature
  - key encipherment
  - client auth
EOF

# 3. Approve the CSR
kubectl certificate approve john-developer
kubectl get csr john-developer        # should show Approved, ssued

# 4. Create role + binding (imperative is faster)
kubectl create role developer \\
  --resource=pods \\
  --verb=create,list,get,update,delete \\
  --namespace=development

kubectl create rolebinding developer-role-binding \\
  --role=developer --user=john \\
  --namespace=development

# 5. Verify John's permissions
kubectl auth can-i update pods --as=john --namespace=development
# yes`
    }
  },
  {
    id: 'cka-csr-2',
    topic: 'cka-csr-rbac',
    difficulty: 'medium',
    title: 'Restrict a Role to a single named ConfigMap',
    scenario: 'Create a Role <code>configmap-updater</code> in namespace <code>secure-ns</code> that grants <code>get, update</code> on configmaps, but ONLY for the configmap named <code>app-config</code>. Bind it to user <code>maint</code>.',
    hint: {
      url: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/#referring-to-resources',
      path: 'Reference → RBAC Authorization → Referring to resources',
      tip: 'kubectl create role supports --resource-name to scope a rule to a specific named instance. In the YAML this maps to "resourceNames" inside the rule.'
    },
    answer: {
      explanation: '<code>resourceNames</code> is the magic field, ithout it the Role applies to all configmaps in the namespace.',
      yaml: `# Imperative (one shot)
kubectl create role configmap-updater \\
  --namespace=secure-ns \\
  --resource=configmaps \\
  --resource-name=app-config \\
  --verb=get,update

kubectl create rolebinding configmap-updater-binding \\
  --namespace=secure-ns \\
  --role=configmap-updater \\
  --user=maint

# Verify scope
kubectl auth can-i update configmap/app-config --as=maint -n secure-ns   # yes
kubectl auth can-i update configmap/other      --as=maint -n secure-ns   # no

# Resulting Role YAML:
# rules:
# - apiGroups: [""]
#   resources: ["configmaps"]
#   resourceNames: ["app-config"]   # the restriction
#   verbs: ["get", "update"]`
    }
  },
  {
    id: 'cka-csr-3',
    topic: 'cka-csr-rbac',
    difficulty: 'medium',
    title: 'ServiceAccount + ClusterRole listing PVs, bound to a pvviewer pod',
    scenario: 'Create ServiceAccount <code>pvviewer</code> in <code>default</code>. Grant it permission to <code>list</code> all PersistentVolumes by creating ClusterRole <code>pvviewer-role</code> and ClusterRoleBinding <code>pvviewer-role-binding</code>. Then create a pod named <code>pvviewer</code> using image <code>redis</code> and serviceAccountName <code>pvviewer</code> in <code>default</code>.',
    hint: {
      url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/',
      path: 'Tasks → Configure Pods and Containers → Configure Service Accounts for Pods',
      tip: 'kubectl create serviceaccount, kubectl create clusterrole --resource=persistentvolumes --verb=list, kubectl create clusterrolebinding --clusterrole=... --serviceaccount=<ns>:<name>. The pod spec needs serviceAccountName (camelCase) at spec level.'
    },
    answer: {
      explanation: 'PVs are cluster-scoped, so a ClusterRole + ClusterRoleBinding is required (a namespaced Role cannot grant access to cluster-scoped resources). <code>--serviceaccount=default:pvviewer</code> in the binding command uses <code>namespace:name</code> form.',
      yaml: `# 1. ServiceAccount
kubectl create serviceaccount pvviewer

# 2. ClusterRole
kubectl create clusterrole pvviewer-role \\
  --resource=persistentvolumes --verb=list

# 3. ClusterRoleBinding (note namespace:name syntax)
kubectl create clusterrolebinding pvviewer-role-binding \\
  --clusterrole=pvviewer-role \\
  --serviceaccount=default:pvviewer

# 4. Pod with serviceAccountName
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: pvviewer
  labels:
    run: pvviewer
spec:
  serviceAccountName: pvviewer
  containers:
  - name: pvviewer
    image: redis
EOF

# 5. Verify
kubectl auth can-i list pv --as=system:serviceaccount:default:pvviewer  # yes
kubectl get pod pvviewer -o jsonpath='{.spec.serviceAccountName}'`
    }
  }
];
