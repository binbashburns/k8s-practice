// Questions for topic 'cka-scheduling'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_CKA_SCHEDULING = [
  {
    id: 'cka-sched-1',
    topic: 'cka-scheduling',
    difficulty: 'medium',
    title: 'PriorityClass + Pod: recreate pod with priorityClassName',
    scenario: 'Create a PriorityClass named <code>low-priority</code> with value <code>50000</code>. A Pod <code>lp-pod</code> exists in namespace <code>low-priority</code>. Modify the pod to use the priority class. Recreate the pod if necessary.',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/',
      path: 'Concepts → Scheduling, Preemption, Eviction → Pod Priority and Preemption',
      tip: 'PriorityClass is cluster-scoped, no namespace. priorityClassName is an immutable pod field, so edit a pod yaml to add it and delete+recreate the pod.'
    },
    answer: {
      explanation: '<code>priorityClassName</code> is immutable on existing pods, dump the pod to YAML, add the field, then <code>delete</code> + <code>apply</code>.',
      yaml: `# 1. Create the PriorityClass
cat <<EOF | kubectl apply -f -
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: low-priority
value: 50000
globalDefault: false
description: "Low priority class"
EOF

# 2. Flush existing pod to a file
kubectl get pod lp-pod -n low-priority -o yaml > lp-pod.yaml

# 3. Edit lp-pod.yaml, add priorityClassName under spec
apiVersion: v1
kind: Pod
metadata:
  name: lp-pod
  namespace: low-priority
spec:
  priorityClassName: low-priority
  containers:
  - name: nginx
    image: nginx

# 4. Recreate the pod
kubectl delete pod lp-pod -n low-priority
kubectl apply -f lp-pod.yaml

# 5. Verify
kubectl get pod lp-pod -n low-priority -o jsonpath='{.spec.priorityClassName}'`
    }
  },
  {
    id: 'cka-sched-2',
    topic: 'cka-scheduling',
    difficulty: 'medium',
    title: 'Taint a worker, place dev-redis (no toleration) and prod-redis (matching toleration)',
    scenario: 'Taint worker <code>node01</code> with <code>env_type=production:NoSchedule</code>. Create pod <code>dev-redis</code> (image <code>redis:alpine</code>, no toleration). Create pod <code>prod-redis</code> (image <code>redis:alpine</code>) with toleration matching <code>key=env_type, operator=Equal, value=production, effect=NoSchedule</code>.',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/',
      path: 'Concepts → Scheduling, Preemption, Eviction → Taints and Tolerations',
      tip: 'kubectl taint node node01 KEY=VALUE:EFFECT. Toleration on the pod under spec.tolerations, fields: key, operator, value, effect. operator Equal needs both key and value, operator Exists matches any value.'
    },
    answer: {
      explanation: 'Taint repels pods that lack a matching toleration. <code>dev-redis</code> (no toleration) gets scheduled elsewhere; <code>prod-redis</code> tolerates the taint and may land on node01.',
      yaml: `# 1. Taint the node
kubectl taint node node01 env_type=production:NoSchedule

# 2. Create dev-redis (no toleration)
kubectl run dev-redis --image=redis:alpine

# 3. Create prod-redis with toleration
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: prod-redis
spec:
  containers:
  - name: prod-redis
    image: redis:alpine
  tolerations:
  - key: env_type
    operator: Equal
    value: production
    effect: NoSchedule
EOF

# 4. Verify placement
kubectl get pods -o wide
# dev-redis  -> NOT on node01
# prod-redis -> may run on node01`
    }
  }
];
