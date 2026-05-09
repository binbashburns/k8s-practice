// Questions for topic 'observability'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_OBSERVABILITY = [
  {
    id: 'obs-1',
    topic: 'observability',
    difficulty: 'fail',
    title: 'Fix pod not ready: wrong probe type (httpGet with exec-style config)',
    scenario: `A pod template <code>goproxy.yaml</code> fails to apply with: <code>unknown field "command" in HTTPGetAction</code>. The liveness probe is typed as <code>httpGet</code> but configured with exec-style <code>command</code> fields. Fix the probe type. Then the pod restarts because <code>initialDelaySeconds: 1</code> is too short, the healthcheck file isn't created for 3 seconds. Fix that too.`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-liveness-command',
      path: 'Tasks → Configure Pods → Liveness, Readiness, Startup Probes → Define a liveness command',
      tip: 'There are 3 probe types: httpGet (needs path+port), exec (needs command list), tcpSocket (needs port). They cannot be mixed. Change httpGet to exec. Then increase initialDelaySeconds so it fires after the healthcheck file exists.'
    },
    answer: {
      explanation: 'Two bugs: (1) probe type mismatch, changed <code>httpGet</code> to <code>exec</code>. (2) initialDelaySeconds too short, increased from 1 to 5.',
      yaml: `# BEFORE (broken):
livenessProbe:
  httpGet:         # wrong type!
    command:
    - cat
    - /healthcheck

# AFTER (fixed):
livenessProbe:
  exec:            # correct type for a command check
    command:
    - cat
    - /healthcheck
  initialDelaySeconds: 5   # was 1, ealthcheck file created after 3s
  periodSeconds: 10`
    }
  },
  {
    id: 'obs-2',
    topic: 'observability',
    difficulty: 'medium',
    title: 'Add HTTP readinessProbe to existing pod at /ready on port 8080',
    scenario: 'Update pod <code>analytics-app</code> (image: <code>kodekloud/webapp-delayed-start</code>) with an HTTP readiness probe. Path: <code>/ready</code>, port: <code>8080</code>.',
    hint: {
      url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes',
      path: 'Tasks → Configure Pods → Probes → Define readiness probes',
      tip: 'Under spec.containers[].readinessProbe, use httpGet with path and port. Since pods cannot be patched in-place, use "kubectl replace -f pod.yaml --force" to delete and recreate.'
    },
    answer: {
      explanation: 'Pods cannot be edited in-place for most spec fields. Get the YAML, add the probe, then use <code>kubectl replace --force</code>.',
      yaml: `# 1. Get current YAML
kubectl get pod analytics-app -o yaml > analytics-app.yaml

# 2. Add readinessProbe under the container:
spec:
  containers:
  - name: simple-webapp
    image: kodekloud/webapp-delayed-start
    ports:
    - containerPort: 8080
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 5

# 3. Replace (delete + recreate)
kubectl replace -f analytics-app.yaml --force`
    }
  },
  {
    id: 'obs-3',
    topic: 'observability',
    difficulty: 'medium',
    title: 'Add livenessProbe (exec) + readinessProbe (httpGet) to fix NotReady pod',
    scenario: 'Pod <code>nginx1401</code> (namespace <code>dev1401</code>) is not Ready. The readiness probe already exists but the container also needs a liveness probe. Add a liveness probe: run <code>ls /var/www/html/file_check</code>, starting after 10 seconds, every 60 seconds.',
    hint: {
      url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-liveness-command',
      path: 'Tasks → Probes → Define a liveness command',
      tip: 'exec probe uses command as a list. initialDelaySeconds controls when the first probe fires. periodSeconds controls frequency.'
    },
    answer: {
      explanation: 'exec probe runs a shell command. If the command exits non-zero, the container is restarted.',
      yaml: `livenessProbe:
  exec:
    command:
    - ls
    - /var/www/html/file_check
  initialDelaySeconds: 10    # wait 10s before first probe
  periodSeconds: 60          # check every 60s`
    }
  },
  {
    id: 'obs-4',
    topic: 'observability',
    difficulty: 'easy',
    title: 'Find pod with highest memory usage using kubectl top, then get its memory limit',
    scenario: 'Three pods <code>hulk</code>, <code>thor</code>, and <code>ironman</code> are running on <code>cluster1</code>. Identify which has highest memory usage. Then get the memory limit configured for that pod and write <code>PodName, emoryLimit</code> to <code>/root/pod-metrics</code>.',
    hint: {
      url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_top/',
      path: 'Reference → kubectl → kubectl top',
      tip: 'kubectl top pods --sort-by=memory shows memory descending. Then use kubectl get pod <name> -o jsonpath or kubectl describe to get the limit.'
    },
    answer: {
      explanation: 'Two steps: (1) find the top memory consumer, (2) get the limit from the pod spec.',
      yaml: `# 1. Find highest memory pod
kubectl top pods --sort-by=memory

# 2. Get memory limit
kubectl get pod hulk -o jsonpath='{.spec.containers[].resources.limits.memory}'
# or
kubectl describe pod hulk | grep -A5 Limits

# 3. Write output
echo "hulk,512Mi" > /root/pod-metrics`
    }
  },
  {
    id: 'obs-5',
    topic: 'observability',
    difficulty: 'easy',
    title: 'Filter pod logs by WARNING and redirect to a file',
    scenario: 'Pod <code>dev-pod-dind-878516</code> has multiple containers. Filter the logs of container <code>log-x</code> for lines containing WARNING and redirect the output to <code>/opt/dind-878516_logs.txt</code> on the controlplane node.',
    hint: {
      url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_logs/',
      path: 'Reference → kubectl → kubectl logs',
      tip: 'kubectl logs <pod> -c <container> to specify a container. Pipe to grep to filter. Redirect with > to a file.'
    },
    answer: {
      explanation: 'One-liner combining kubectl logs + grep + redirect.',
      yaml: `kubectl logs dev-pod-dind-878516 -c log-x | grep WARNING > /opt/dind-878516_logs.txt

# Verify it worked:
cat /opt/dind-878516_logs.txt | head -5`
    }
  },
  {
    id: 'me6-5',
    topic: 'observability',
    difficulty: 'fail',
    title: 'Get logs from a named sidecar container and redirect to a file',
    scenario: 'On <code>cluster1</code>, a pod named <code>log-generator-pod</code> runs in the default namespace. It has two containers. Get the logs of the <code>sidecar</code> container and save them to <code>/root/ckad21-exam.txt</code> on the student node.',
    hint: {
      url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_logs/',
      path: 'Reference → kubectl → kubectl logs',
      tip: "Use kubectl logs <pod> -c <container-name> to target a specific container. Redirect with > to write to a file. If unsure of container names: kubectl get pod log-generator-pod -o jsonpath='{.spec.containers[*].name}'"
    },
    answer: {
      explanation: 'When a pod has multiple containers, <code>kubectl logs</code> requires <code>-c &lt;container&gt;</code> to target the right one. Redirect output with <code>&gt;</code> to store it.',
      yaml: `kubectl config use-context cluster1

# Find container names (if you forget):
kubectl get pod log-generator-pod -o jsonpath='{.spec.containers[*].name}'
# Output: ckad-exam sidecar

# Get sidecar logs and save to file:
kubectl logs log-generator-pod -c sidecar > /root/ckad21-exam.txt

# Verify:
cat /root/ckad21-exam.txt`
    }
  },
  {
    id: 'me5-5',
    topic: 'observability',
    difficulty: 'hard',
    title: 'Debug pod stuck in Init:StartError, fix missing shell interpreter in init container command',
    scenario: 'Pod <code>ckad-frontend-pod</code> in namespace <code>ckad-21-production</code> on <code>cluster3</code> is stuck in <code>Init:StartError</code>. Find the root cause and fix it to bring the pod to Running state.',
    hint: {
      url: 'https://kubernetes.io/docs/tasks/debug/debug-application/debug-init-containers/',
      path: 'Tasks → Debug Applications → Debug Init Containers',
      tip: `Init:StartError means the init container process failed to start, the binary or interpreter doesn't exist or wasn't specified. Run "kubectl describe pod" and look at the init container's Last State / Message. Then get the pod YAML and check the command field, if you have a shell command without /bin/sh -c, the container can't run it.`
    },
    answer: {
      explanation: 'The init container had a shell command without the <code>/bin/sh -c</code> interpreter prefix. The container runtime tried to execute the string directly as a binary, hich fails. Fix: prepend <code>/bin/sh</code> and <code>-c</code> to the command list.',
      yaml: `# 1. Check pod status
kubectl get pods -n ckad-21-production

# 2. Describe to see the error
kubectl describe pod ckad-frontend-pod -n ckad-21-production
# Look for: "OCI runtime create failed: unable to start container process"
# or: "exec: command not found"

# 3. Get the YAML
kubectl get pod ckad-frontend-pod -n ckad-21-production -o yaml > fix-pod.yaml

# 4. Find the init container command, it probably looks like:
#   command:
#   - "some shell command string"     ← missing interpreter!

# 5. Fix it:
#   command:
#   - /bin/sh        ← add interpreter
#   - -c             ← add -c flag
#   - "some shell command string"

# 6. Delete and recreate
kubectl delete pod ckad-frontend-pod -n ckad-21-production
kubectl apply -f fix-pod.yaml

# 7. Verify
kubectl get pods -n ckad-21-production`
    }
  }
];
