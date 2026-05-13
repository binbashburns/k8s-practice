// Questions for topic 'deployment'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_DEPLOYMENT = [
  {
    id: 'dep-1',
    topic: 'deployment',
    difficulty: 'medium',
    title: 'RollingUpdate Deployment: maxSurge 1, maxUnavailable 2, then rollback',
    scenario: 'Create Deployment <code>nginx-deploy</code> with 4 replicas, image <code>nginx:1.16</code>, RollingUpdate with maxSurge 1 and maxUnavailable 2. Upgrade to <code>nginx:1.17</code>. Once all pods are updated, roll back to the previous version.',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-update-deployment',
      path: 'Concepts → Deployments → Rolling Update Deployment',
      tip: 'strategy.type: RollingUpdate, then strategy.rollingUpdate.maxSurge and maxUnavailable. For rollback: "kubectl rollout undo deployment/<name>" goes back one revision.'
    },
    answer: {
      explanation: 'Create with the strategy, update with set image, rollback with rollout undo.',
      yaml: `# Create
kubectl create deploy nginx-deploy \\
  --image=nginx:1.16 --replicas=4 \\
  -o yaml --dry-run=client > deploy.yaml
# (edit strategy in deploy.yaml, then apply)

# Or full YAML:
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 2

# Update image
kubectl set image deployment/nginx-deploy nginx=nginx:1.17

# Watch rollout
kubectl rollout status deployment/nginx-deploy

# Roll back
kubectl rollout undo deployment/nginx-deploy`
    }
  },
  {
    id: 'dep-2',
    topic: 'deployment',
    difficulty: 'hard',
    title: 'Blue/Green: route 70% traffic to blue, 30% to green using replica counts',
    scenario: 'Create deployments <code>blue-apd</code> (image <code>webapp-color:v1</code>, label <code>type-one: blue</code>) and <code>green-apd</code> (image <code>webapp-color:v2</code>, label <code>type-two: green</code>). Both pods must have label <code>version: v1</code>. Create service <code>route-apd-svc</code> (NodePort, port 8080) selecting on <code>version: v1</code>. Route 70% to blue, 30% to green using replica counts (total = 10 pods).',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#scaling-a-deployment',
      path: 'Concepts → Deployments → Scaling a Deployment',
      tip: 'The service selects on the SHARED label (version: v1), not deployment-specific labels. Traffic splits proportionally to pod count. 70/30 = 7 blue replicas, 3 green replicas.'
    },
    answer: {
      explanation: 'The shared label <code>version: v1</code> is the key. The service sees all 10 pods and routes randomly, eplica count controls the percentage.',
      yaml: `# blue-apd: 7 replicas = 70%
spec:
  replicas: 7
  selector:
    matchLabels:
      type-one: blue
      version: v1
  template:
    metadata:
      labels:
        type-one: blue
        version: v1         # shared label, service selects this
    spec:
      containers:
      - image: kodekloud/webapp-color:v1
        name: blue-apd
---
# green-apd: 3 replicas = 30%
spec:
  replicas: 3
  selector:
    matchLabels:
      type-two: green
      version: v1
  template:
    metadata:
      labels:
        type-two: green
        version: v1         # same shared label
---
# Service selects ALL pods with version: v1
spec:
  type: NodePort
  selector:
    version: v1             # catches both blue and green pods
  ports:
  - port: 8080
    targetPort: 8080`
    }
  },
  {
    id: 'dep-3',
    topic: 'deployment',
    difficulty: 'hard',
    title: 'Canary: reduce new deployment below 40% traffic without increasing existing replicas',
    scenario: 'Two deployments: <code>ruby-alpha-apd</code> (5 replicas) and <code>cube-alpha-apd</code> (5 replicas) both selected by service <code>alpha-apd-service</code>. Currently ~50% goes to each. Reduce traffic to <code>cube-alpha-apd</code> below 40%. Do NOT increase replicas of <code>ruby-alpha-apd</code>.',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#scaling-a-deployment',
      path: 'Concepts → Deployments → Scaling',
      tip: 'Total = 10 pods, 50/50 split. To get cube-alpha-apd below 40%, scale it down. With ruby at 5, cube needs to be ≤ 3 for cube to be ≤ 37.5% of total. Scale cube to 2: 2/7 = ~28.5%.'
    },
    answer: {
      explanation: 'Math: ruby=5 fixed. For cube < 40%: cube/(5+cube) < 0.4 → cube < 3.33 → max cube=3. Scale to 2 for safety.',
      yaml: `kubectl scale deployment cube-alpha-apd \\
  --replicas=2 \\
  -n alpha-ns-apd

# Verify: 2/(5+2) = 28.5%, well below 40%`
    }
  },
  {
    id: 'me5-2',
    topic: 'deployment',
    difficulty: 'medium',
    title: 'kubectl set image + scale deployment + record new image to file via SSH',
    scenario: 'Deployment <code>results-apd</code> runs in namespace <code>dashboard-apd</code> on <code>cluster2</code>. Update its container image to <code>nginx:1.23.3</code>. SSH into <code>cluster2-controlplane</code> and write the new image name to <code>/root/records/new-image-records.txt</code>. Then scale the deployment to 4 replicas.',
    hint: {
      url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_set/kubectl_set_image/',
      path: 'Reference → kubectl → kubectl set image',
      tip: `First use "kubectl describe deploy" to find the exact container name, you need it for set image. Syntax: kubectl set image deploy/<name> <container-name>=<image>. Then SSH to the node and use echo + redirect to write the file. Create the directory first if it doesn't exist.`
    },
    answer: {
      explanation: 'Three distinct steps: update image, write record to file (requires SSH), scale. Finding the container name from describe is the step people miss.',
      yaml: `# 1. Find the container name
kubectl describe -n dashboard-apd deploy results-apd | grep -A5 "Pod Template"
# Look for: Container: results-apd-container (or whatever it is)

# 2. Update the image
kubectl set image -n dashboard-apd deploy results-apd \\
  results-apd-container=nginx:1.23.3

# 3. SSH to controlplane and record the image
ssh cluster2-controlplane
mkdir -p /root/records
echo "nginx:1.23.3" > /root/records/new-image-records.txt
exit

# 4. Scale to 4
kubectl scale deployment -n dashboard-apd results-apd --replicas=4

# 5. Verify
kubectl get deployments,pods -n dashboard-apd`
    }
  },
  {
    id: 'me5-4',
    topic: 'deployment',
    difficulty: 'medium',
    title: 'RBAC: Role restricted to a specific named ConfigMap instance',
    scenario: 'Create a Role named <code>configmap-updater</code> in namespace <code>ckad21-auth2-aecs</code>. It should grant <code>update</code> and <code>get</code> permissions on <code>configmaps</code>, but ONLY for the specific ConfigMap named <code>ckad-cnfmp-aecs</code>, not all ConfigMaps.',
    hint: {
      url: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/#referring-to-resources',
      path: 'Reference → RBAC Authorization → Referring to resources',
      tip: 'kubectl create role supports --resource-name to restrict a rule to a specific named instance of a resource. Without it, the role grants access to ALL configmaps. In YAML this maps to the "resourceNames" field in the rules list.'
    },
    answer: {
      explanation: '<span class="highlight">resourceNames</span> is the key field, it scopes the permission to a specific named resource instance. Without it, the role applies to all configmaps in the namespace.',
      yaml: `# Imperative (one-liner):
kubectl create role configmap-updater \\
  --namespace=ckad21-auth2-aecs \\
  --resource=configmaps \\
  --resource-name=ckad-cnfmp-aecs \\
  --verb=update,get

---
# What the resulting YAML looks like:
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: configmap-updater
  namespace: ckad21-auth2-aecs
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  resourceNames: ["ckad-cnfmp-aecs"]  # restricts to this specific instance
  verbs: ["update", "get"]`
    }
  },
  {
    id: 'dep-hpa-1',
    topic: 'deployment',
    difficulty: 'medium',
    title: 'HPA scaling on a custom Pod metric (requests_per_second, AverageValue)',
    scenario: 'Create an HPA <code>api-hpa</code> for Deployment <code>api-deployment</code> in namespace <code>api</code>. Scale on custom metric <code>requests_per_second</code> with target <code>AverageValue: 1000</code>. <code>minReplicas: 1</code>, <code>maxReplicas: 20</code>. Errors about the metric not being tracked by metrics-server can be ignored.',
    hint: {
      url: 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/',
      path: 'Tasks → Run Applications → Horizontal Pod Autoscaling',
      tip: 'autoscaling/v2 supports custom metrics. type: Pods with target.type: AverageValue means "average value across all pods". Use kubectl create -f api-hpa.yaml (kubectl autoscale only covers CPU/memory).'
    },
    answer: {
      explanation: 'Custom pod metrics use <code>type: Pods</code> + <code>target.type: AverageValue</code>. The <code>averageValue</code> is a quantity (string), the API expects <code>"1000"</code> in quotes.',
      yaml: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-deployment
  minReplicas: 1
  maxReplicas: 20
  metrics:
  - type: Pods
    pods:
      metric:
        name: requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"

# Apply and inspect
kubectl create -f api-hpa.yaml
kubectl get hpa -n api api-hpa
kubectl describe hpa -n api api-hpa`
    }
  }
];
