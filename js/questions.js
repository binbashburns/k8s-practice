// Question bank. Each entry: { id, topic, difficulty, title, scenario, hint, answer }.
// difficulty: "fail" is data only, surfaces in the Priority filter and adds the red border.

const QUESTIONS = [
  // ── NETWORK POLICY ────────────────────────────────────────────────────────
  {
    id: 'np-1', topic: 'network-policy', difficulty: 'fail',
    title: 'Fix failed connectivity: allow webapp-color → secure-pod on TCP 80',
    scenario: `A <code>default-deny</code> NetworkPolicy exists in the <code>default</code> namespace. Pods named <code>secure-pod</code> (label <code>run: secure-pod</code>) cannot receive traffic. Create a NetworkPolicy that allows the pod <code>webapp-color</code> (label <code>name: webapp-color</code>) to reach <code>secure-pod</code> on TCP port 80. Do NOT delete the existing policy.`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/',
      path: 'Concepts → Services, LB & Networking → Network Policies',
      tip: 'Find the "podSelector" + "ingress.from.podSelector" example. The key is spec.podSelector (who this applies to) vs ingress.from.podSelector (who is allowed in).'
    },
    answer: {
      explanation: `The existing default-deny blocks everything. <span class="highlight">Add</span> a new allow policy, never delete the deny. The podSelector targets secure-pod; ingress.from.podSelector allows webapp-color.`,
      yaml: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-webapp-to-secure
  namespace: default
spec:
  podSelector:
    matchLabels:
      run: secure-pod        # THIS policy applies to pods with this label
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          name: webapp-color # allow traffic FROM pods with this label
    ports:
    - protocol: TCP
      port: 80`
    }
  },
  {
    id: 'np-2', topic: 'network-policy', difficulty: 'hard',
    title: 'Edit existing NetworkPolicy to add a new allowed source',
    scenario: `A NetworkPolicy <code>netpol-ckad13-svcn</code> already allows ingress from pods with label <code>tier: server</code>. Edit it to ALSO allow ingress from pods with label <code>access: allowed</code>. Do not change or remove the existing rule.`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/#networkpolicy-resource',
      path: 'Concepts → Network Policies → NetworkPolicy resource',
      tip: 'In the ingress.from list, each separate dash (-) item is an OR condition. Add a new - podSelector item to add another allowed source.'
    },
    answer: {
      explanation: `In the <code>ingress.from</code> list, items at the same dash level are OR conditions. Just add a second <code>- podSelector</code> entry.`,
      yaml: `spec:
  podSelector:
    matchLabels:
      app: kk-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          tier: server         # existing rule, do not remove
    - podSelector:             # ADD THIS (OR condition)
        matchLabels:
          access: allowed`
    }
  },
  {
    id: 'np-3', topic: 'network-policy', difficulty: 'medium',
    title: 'Create NetworkPolicy: allow only pods with label access=redis to reach a Redis deployment on port 6379',
    scenario: `A <code>redis</code> Deployment (label <code>app: redis</code>) exists. Create a NetworkPolicy named <code>redis-access</code> that allows only pods with label <code>access: redis</code> to reach it on TCP 6379. All other ingress to Redis pods should be blocked.`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/',
      path: 'Concepts → Network Policies',
      tip: 'podSelector on the policy = which pods are protected (app: redis). ingress.from.podSelector = who can reach them (access: redis). policyTypes must include Ingress.'
    },
    answer: {
      explanation: `The policy's podSelector must match the Redis pods (app: redis, NOT role: redis, check the actual pod labels). The ingress from rule uses access: redis.`,
      yaml: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: redis-access
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: redis             # protects pods with this label
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          access: redis      # only these pods can connect
    ports:
    - protocol: TCP
      port: 6379`
    }
  },
  {
    id: 'np-4', topic: 'network-policy', difficulty: 'hard',
    title: 'Add Egress rule allowing DNS but not breaking existing ingress',
    scenario: `Pods with label <code>app: backend</code> need to reach a database (label <code>app: db</code>) on port 5432. Add an Egress NetworkPolicy. Make sure pods can still resolve DNS (UDP/TCP port 53).`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/#egress',
      path: 'Concepts → Network Policies → Egress section',
      tip: 'Add TWO egress rules: one to the DB pod on 5432, and one with no podSelector but ports: [{port: 53, protocol: UDP}] for DNS. Without the DNS rule, pods cannot resolve service names.'
    },
    answer: {
      explanation: `<span class="highlight">DNS trap:</span> Once you add an Egress policyType, ALL egress is blocked except what you explicitly allow. Always add UDP 53 for DNS.`,
      yaml: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-egress
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Egress
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: db
    ports:
    - protocol: TCP
      port: 5432
  - ports:               # Allow DNS, LWAYS include this!
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 53`
    }
  },

  // ── INGRESS ───────────────────────────────────────────────────────────────
  {
    id: 'ing-1', topic: 'ingress', difficulty: 'fail',
    title: 'Multi-host Ingress: route two hostnames to two services',
    scenario: `Create an Ingress named <code>ingress-vh-routing</code>. Route:<br>• <code>watch.ecom-store.com/video</code> → <code>video-service</code><br>• <code>apparels.ecom-store.com/wear</code> → <code>apparels-service</code><br><br>Add annotation <code>nginx.ingress.kubernetes.io/rewrite-target: /</code>. The IngressController is exposed on NodePort 30093 externally. The services run on port 8080 internally.`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/ingress/#types-of-ingress',
      path: 'Concepts → Ingress → Name based virtual hosting',
      tip: 'Find the "Name based virtual hosting" example. The key mistake: backend.service.port.number is the SERVICE port (8080), NOT the IngressController NodePort (30093). Run "kubectl get svc" to see the right number.'
    },
    answer: {
      explanation: `<span class="highlight">backend.service.port is the Service's internal port, not the NodePort.</span> 30093 is the NodePort on the IngressController's Service (external-facing). The backend port is always the workload Service's ClusterIP port.`,
      yaml: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-vh-routing
  namespace: default
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: watch.ecom-store.com
    http:
      paths:
      - pathType: Prefix
        path: /video
        backend:
          service:
            name: video-service
            port:
              number: 8080  # Service port, NOT the 30093 NodePort!
  - host: apparels.ecom-store.com
    http:
      paths:
      - pathType: Prefix
        path: /wear
        backend:
          service:
            name: apparels-service
            port:
              number: 8080`
    }
  },
  {
    id: 'ing-2', topic: 'ingress', difficulty: 'medium',
    title: 'Single-path Ingress with ingressClassName and ssl-redirect annotation',
    scenario: `Applications run in the <code>global-space</code> namespace. Create Ingress <code>ingress-resource-xnz</code> exposing <code>/eat</code> → <code>food-service:8080</code>. Use ingress class <code>nginx</code>. Add annotations: <code>rewrite-target: /</code> and <code>ssl-redirect: "false"</code>.`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/ingress/#ingress-class',
      path: 'Concepts → Ingress → IngressClass',
      tip: 'The ingressClassName field goes under spec, not annotations. The imperative command "kubectl create ingress" supports --class and --annotation flags directly.'
    },
    answer: {
      explanation: `Use <code>spec.ingressClassName: nginx</code> for the class. The two annotations go in metadata.annotations. Imperative command shown too.`,
      yaml: `# Imperative (fastest on exam):
kubectl create ingress ingress-resource-xnz \\
  --namespace global-space \\
  --rule='/eat=food-service:8080' \\
  --annotation='nginx.ingress.kubernetes.io/rewrite-target=/' \\
  --annotation='nginx.ingress.kubernetes.io/ssl-redirect=false' \\
  --class=nginx

---
# YAML version:
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-resource-xnz
  namespace: global-space
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  ingressClassName: nginx
  rules:
  - http:
      paths:
      - path: /eat
        pathType: Prefix
        backend:
          service:
            name: food-service
            port:
              number: 8080`
    }
  },
  {
    id: 'ing-3', topic: 'ingress', difficulty: 'hard',
    title: 'Troubleshoot: IngressController crashing with "default-backend-service not found"',
    scenario: `The IngressController pod in <code>ingress-nginx</code> namespace keeps crashing. Logs show: <code>No service with name default-backend-service found in namespace default</code>. The actual backend service <code>default-backend-service</code> lives in the <code>green-space</code> namespace. Fix this without recreating the Ingress resource.`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/',
      path: 'Concepts → Ingress Controllers',
      tip: 'The IngressController deployment has a --default-backend-service arg. Get the deployment YAML, edit the arg to use green-space/default-backend-service, delete the old deployment, and apply the fixed one.'
    },
    answer: {
      explanation: `The IngressController deployment has a CLI arg specifying the backend namespace. Save → Delete → Edit → Re-apply.`,
      yaml: `# 1. Save the deployment
kubectl get -n ingress-nginx deploy ingress-nginx-controller -o yaml > ing-ctrl.yaml

# 2. Delete it
kubectl delete -n ingress-nginx deploy ingress-nginx-controller

# 3. Edit ing-ctrl.yaml, find the args section:
#    Change:
#      - --default-backend-service=default/default-backend-service
#    To:
#      - --default-backend-service=green-space/default-backend-service

# 4. Apply
kubectl apply -f ing-ctrl.yaml

# 5. Fix Ingress paths if needed
kubectl edit ingress <name> -n green-space
# Update paths /app1 → /app-wear, /app2 → /app-video`
    }
  },

  // ── CRONJOB ───────────────────────────────────────────────────────────────
  {
    id: 'cj-1', topic: 'cronjob', difficulty: 'fail',
    title: 'CronJob: every 1 min, backoffLimit 25, activeDeadlineSeconds 20',
    scenario: `Create a CronJob named <code>dice</code> that runs every minute. Image: <code>kodekloud/throw-dice</code>. It should:<br>• complete once (<code>completions: 1</code>)<br>• retry up to 25 times (<code>backoffLimit: 25</code>)<br>• fail if not done within 20 seconds (<code>activeDeadlineSeconds: 20</code>)<br>• use <code>restartPolicy: Never</code>`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/#cronjob-spec',
      path: 'Concepts → CronJob → CronJob spec',
      tip: 'In the docs, look for the "jobTemplate.spec" section. backoffLimit and activeDeadlineSeconds are Job fields; they live under jobTemplate.spec, NOT the top-level CronJob spec.'
    },
    answer: {
      explanation: `<span class="highlight">The nesting trap:</span> CronJob.spec has schedule + jobTemplate. Job fields (backoffLimit, activeDeadlineSeconds) live inside jobTemplate.spec, one level deeper than you might expect.`,
      yaml: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: dice
spec:
  schedule: "*/1 * * * *"   # every 1 minute
  jobTemplate:
    spec:
      completions: 1
      backoffLimit: 25          # HERE (jobTemplate.spec)
      activeDeadlineSeconds: 20 # HERE (jobTemplate.spec)
      template:
        spec:
          containers:
          - name: dice
            image: kodekloud/throw-dice
          restartPolicy: Never  # must be Never or OnFailure in Jobs`
    }
  },
  {
    id: 'cj-2', topic: 'cronjob', difficulty: 'medium',
    title: 'CronJob: every 30 minutes, list processes with ps -eaf (run in shell)',
    scenario: `In namespace <code>ckad-job</code>, create a CronJob named <code>simple-python-job</code> that runs every 30 minutes. Image: <code>python</code>. Run the command <code>ps -eaf</code> inside a shell (<code>/bin/sh -c</code>).`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/',
      path: 'Concepts → CronJob',
      tip: 'The command must be run in a shell so it can be parsed. Use command: ["/bin/sh", "-c", "ps -eaf"]. Cron schedule for every 30 min: "*/30 * * * *"'
    },
    answer: {
      explanation: `When a command needs shell features (pipes, env vars, etc.) use <code>/bin/sh -c "..."</code>. The imperative command also works here.`,
      yaml: `# Imperative (fastest):
kubectl create cronjob simple-python-job \\
  -n ckad-job \\
  --image=python \\
  --schedule="*/30 * * * *" \\
  -- /bin/sh -c "ps -eaf"

---
# YAML:
apiVersion: batch/v1
kind: CronJob
metadata:
  name: simple-python-job
  namespace: ckad-job
spec:
  schedule: "*/30 * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: simple-python-job
            image: python
            command:
            - /bin/sh
            - -c
            - ps -eaf
          restartPolicy: OnFailure`
    }
  },
  {
    id: 'cj-3', topic: 'cronjob', difficulty: 'medium',
    title: 'Job: compute pi to 1024 places, backoffLimit 5, activeDeadlineSeconds 100',
    scenario: `In namespace <code>ckad-job</code>, create a Job named <code>very-long-pi</code>. Image: <code>perl:5.34.0</code>. Command: <code>perl -Mbignum=bpi -wle 'print bpi(1024)'</code>. Max 5 retries. Fail if not done in 100 seconds.`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/workloads/controllers/job/',
      path: 'Concepts → Workload Management → Job',
      tip: 'In the Job spec (not CronJob), backoffLimit and activeDeadlineSeconds sit directly under spec, they are Job fields. Look for the "Writing a Job spec" section in the docs.'
    },
    answer: {
      explanation: `In a standalone Job, backoffLimit and activeDeadlineSeconds are at <code>spec</code> level, no jobTemplate wrapper needed (that wrapper is only for CronJobs).`,
      yaml: `apiVersion: batch/v1
kind: Job
metadata:
  name: very-long-pi
  namespace: ckad-job
spec:
  backoffLimit: 5              # direct on spec (it's a Job, not CronJob)
  activeDeadlineSeconds: 100   # direct on spec
  template:
    spec:
      containers:
      - name: pi
        image: perl:5.34.0
        command:
        - perl
        - -Mbignum=bpi
        - -wle
        - print bpi(1024)
      restartPolicy: Never`
    }
  },

  // ── OBSERVABILITY ─────────────────────────────────────────────────────────
  {
    id: 'obs-1', topic: 'observability', difficulty: 'fail',
    title: 'Fix pod not ready: wrong probe type (httpGet with exec-style config)',
    scenario: `A pod template <code>goproxy.yaml</code> fails to apply with: <code>unknown field "command" in HTTPGetAction</code>. The liveness probe is typed as <code>httpGet</code> but configured with exec-style <code>command</code> fields. Fix the probe type. Then the pod restarts because <code>initialDelaySeconds: 1</code> is too short, the healthcheck file isn't created for 3 seconds. Fix that too.`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-liveness-command',
      path: 'Tasks → Configure Pods → Liveness, Readiness, Startup Probes → Define a liveness command',
      tip: 'There are 3 probe types: httpGet (needs path+port), exec (needs command list), tcpSocket (needs port). They cannot be mixed. Change httpGet to exec. Then increase initialDelaySeconds so it fires after the healthcheck file exists.'
    },
    answer: {
      explanation: `Two bugs: (1) probe type mismatch, changed <code>httpGet</code> to <code>exec</code>. (2) initialDelaySeconds too short, increased from 1 to 5.`,
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
    id: 'obs-2', topic: 'observability', difficulty: 'medium',
    title: 'Add HTTP readinessProbe to existing pod at /ready on port 8080',
    scenario: `Update pod <code>analytics-app</code> (image: <code>kodekloud/webapp-delayed-start</code>) with an HTTP readiness probe. Path: <code>/ready</code>, port: <code>8080</code>.`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes',
      path: 'Tasks → Configure Pods → Probes → Define readiness probes',
      tip: 'Under spec.containers[].readinessProbe, use httpGet with path and port. Since pods cannot be patched in-place, use "kubectl replace -f pod.yaml --force" to delete and recreate.'
    },
    answer: {
      explanation: `Pods cannot be edited in-place for most spec fields. Get the YAML, add the probe, then use <code>kubectl replace --force</code>.`,
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
    id: 'obs-3', topic: 'observability', difficulty: 'medium',
    title: 'Add livenessProbe (exec) + readinessProbe (httpGet) to fix NotReady pod',
    scenario: `Pod <code>nginx1401</code> (namespace <code>dev1401</code>) is not Ready. The readiness probe already exists but the container also needs a liveness probe. Add a liveness probe: run <code>ls /var/www/html/file_check</code>, starting after 10 seconds, every 60 seconds.`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-liveness-command',
      path: 'Tasks → Probes → Define a liveness command',
      tip: 'exec probe uses command as a list. initialDelaySeconds controls when the first probe fires. periodSeconds controls frequency.'
    },
    answer: {
      explanation: `exec probe runs a shell command. If the command exits non-zero, the container is restarted.`,
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
    id: 'obs-4', topic: 'observability', difficulty: 'easy',
    title: 'Find pod with highest memory usage using kubectl top, then get its memory limit',
    scenario: `Three pods <code>hulk</code>, <code>thor</code>, and <code>ironman</code> are running on <code>cluster1</code>. Identify which has highest memory usage. Then get the memory limit configured for that pod and write <code>PodName, emoryLimit</code> to <code>/root/pod-metrics</code>.`,
    hint: {
      url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_top/',
      path: 'Reference → kubectl → kubectl top',
      tip: 'kubectl top pods --sort-by=memory shows memory descending. Then use kubectl get pod <name> -o jsonpath or kubectl describe to get the limit.'
    },
    answer: {
      explanation: `Two steps: (1) find the top memory consumer, (2) get the limit from the pod spec.`,
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
    id: 'obs-5', topic: 'observability', difficulty: 'easy',
    title: 'Filter pod logs by WARNING and redirect to a file',
    scenario: `Pod <code>dev-pod-dind-878516</code> has multiple containers. Filter the logs of container <code>log-x</code> for lines containing WARNING and redirect the output to <code>/opt/dind-878516_logs.txt</code> on the controlplane node.`,
    hint: {
      url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_logs/',
      path: 'Reference → kubectl → kubectl logs',
      tip: 'kubectl logs <pod> -c <container> to specify a container. Pipe to grep to filter. Redirect with > to a file.'
    },
    answer: {
      explanation: `One-liner combining kubectl logs + grep + redirect.`,
      yaml: `kubectl logs dev-pod-dind-878516 -c log-x | grep WARNING > /opt/dind-878516_logs.txt

# Verify it worked:
cat /opt/dind-878516_logs.txt | head -5`
    }
  },

  // ── APP DESIGN & BUILD ────────────────────────────────────────────────────
  {
    id: 'db-1', topic: 'design-build', difficulty: 'medium',
    title: 'Sidecar container: write date to shared volume every 5 seconds',
    scenario: `Create pod <code>ckad-web-pod</code> in namespace <code>ckad-multi-containers</code> with an <code>emptyDir</code> volume <code>my-vol</code>. Main container <code>web-app</code> runs <code>nginx:1.16</code>, mounting <code>my-vol</code> at <code>/usr/share/nginx/html</code>. Sidecar <code>log-container</code> runs <code>alpine</code>, writes <code>$(date) Hi I am from Sidecar container</code> to <code>/var/log/index.html</code> every 5 seconds.`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/',
      path: 'Concepts → Workloads → Pods → Sidecar Containers',
      tip: 'In K8s 1.29+, sidecars are defined in spec.initContainers with restartPolicy: Always. This makes them start before main containers and restart independently. The key difference from a regular initContainer is the restartPolicy field.'
    },
    answer: {
      explanation: `Sidecar pattern: <code>restartPolicy: Always</code> inside initContainers makes it a true sidecar (K8s 1.29+). Both containers share the emptyDir volume.`,
      yaml: `apiVersion: v1
kind: Pod
metadata:
  name: ckad-web-pod
  namespace: ckad-multi-containers
spec:
  volumes:
  - name: my-vol
    emptyDir: {}
  containers:
  - name: web-app
    image: nginx:1.16
    ports:
    - containerPort: 80
    volumeMounts:
    - name: my-vol
      mountPath: /usr/share/nginx/html
  initContainers:
  - name: log-container
    image: alpine
    restartPolicy: Always    # makes it a sidecar (K8s 1.29+)
    command:
    - /bin/sh
    - -c
    - while true; do echo "$(date -u) Hi I am from Sidecar container" >> /var/log/index.html; sleep 5; done
    volumeMounts:
    - name: my-vol
      mountPath: /var/log`
    }
  },
  {
    id: 'db-2', topic: 'design-build', difficulty: 'medium',
    title: 'Multi-container pod: two containers, env var in second container',
    scenario: `Create pod <code>cuda-pod</code> in namespace <code>ckad-multi-containers</code>. Container 1: <code>alpha</code>, image <code>alpine</code>, env <code>release=stable</code>, must stay running. Container 2: <code>beta</code>, image <code>nginx:1.17</code>, containerPort 8080.`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/',
      path: 'Tasks → Inject Data → Define an environment variable',
      tip: 'For alpine to stay running, it needs a sleep command. env vars use the spec.containers[].env list with name/value pairs. Both containers go under spec.containers, no special field needed.'
    },
    answer: {
      explanation: `Alpine has no long-running process by default, add <code>command: ["/bin/sh", "-c", "sleep 3600"]</code> or it exits immediately.`,
      yaml: `apiVersion: v1
kind: Pod
metadata:
  name: cuda-pod
  namespace: ckad-multi-containers
  labels:
    environment: dev
spec:
  containers:
  - name: alpha
    image: alpine
    command: ["/bin/sh", "-c", "sleep 3600"]  # keep it running!
    env:
    - name: release
      value: stable
  - name: beta
    image: nginx:1.17
    ports:
    - containerPort: 8080`
    }
  },
  {
    id: 'db-3', topic: 'design-build', difficulty: 'medium',
    title: 'ConfigMap + pod: env var from ConfigMap, emptyDir volume for logs',
    scenario: `Create a ConfigMap <code>time-config</code> in namespace <code>dvl1987</code> with key <code>TIME_FREQ=10</code>. Create pod <code>time-check</code> using image <code>busybox</code>. The container should run: <code>while true; do date; sleep $TIME_FREQ; done &gt; /opt/time/time-check.log</code>. Mount an emptyDir at <code>/opt/time</code>. Get TIME_FREQ from the ConfigMap.`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/#define-container-environment-variables-using-configmap-data',
      path: 'Tasks → Configure Pods → ConfigMaps → Define env vars from ConfigMap',
      tip: 'Use env.valueFrom.configMapKeyRef to pull a single key from a ConfigMap. The command list format is important: use ["/bin/sh", "-c", "command string"] for shell commands. emptyDir goes in volumes, not referenced by storageClassName.'
    },
    answer: {
      explanation: `The command redirects to a file, it must be in shell form (<code>/bin/sh -c</code>). The env is sourced from the ConfigMap via <code>configMapKeyRef</code>.`,
      yaml: `---
apiVersion: v1
kind: ConfigMap
metadata:
  name: time-config
  namespace: dvl1987
data:
  TIME_FREQ: "10"
---
apiVersion: v1
kind: Pod
metadata:
  name: time-check
  namespace: dvl1987
spec:
  volumes:
  - name: log-volume
    emptyDir: {}
  containers:
  - name: time-check
    image: busybox
    command:
    - /bin/sh
    - -c
    - while true; do date; sleep $TIME_FREQ; done > /opt/time/time-check.log
    env:
    - name: TIME_FREQ
      valueFrom:
        configMapKeyRef:
          name: time-config
          key: TIME_FREQ
    volumeMounts:
    - name: log-volume
      mountPath: /opt/time`
    }
  },
  {
    id: 'db-4', topic: 'design-build', difficulty: 'hard',
    title: 'CRD: create a CustomResourceDefinition with schema validation',
    scenario: `Create a CRD for resource kind <code>Foo</code> (plural <code>foos</code>) in group <code>samplecontroller.example.com</code>, version <code>v1alpha1</code>. Schema: <code>deploymentName</code> (string) and <code>replicas</code> (integer, min 1, max 5). Include a <code>status</code> subresource. Namespace scoped.`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/',
      path: 'Tasks → Extend Kubernetes → CRDs',
      tip: 'Find the "Validation" section. The schema goes under spec.versions[].schema.openAPIV3Schema. Status subresource is enabled by spec.versions[].subresources.status: {}. The CRD name must be plural.group format: foos.samplecontroller.example.com'
    },
    answer: {
      explanation: `CRD name = <code>plural.group</code>. Schema validation goes in openAPIV3Schema. status subresource unlocks <code>kubectl get foo/status</code>.`,
      yaml: `apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: foos.samplecontroller.example.com  # must be plural.group
spec:
  group: samplecontroller.example.com
  scope: Namespaced
  names:
    kind: Foo
    plural: foos
    singular: foo
  versions:
  - name: v1alpha1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              deploymentName:
                type: string
              replicas:
                type: integer
                minimum: 1
                maximum: 5
          status:
            type: object
            properties:
              availableReplicas:
                type: integer
    subresources:
      status: {}    # enables status subresource`
    }
  },
  {
    id: 'db-5', topic: 'design-build', difficulty: 'medium',
    title: 'Security context: privileged pod + add SYS_TIME capability',
    scenario: `Update pod <code>app-sec-kff3345</code> to run as root (<code>runAsNonRoot: false</code>) and add capability <code>SYS_TIME</code>. The pod runs image <code>ubuntu</code> with <code>sleep 4800</code>.`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/configure-pod-container/security-context/#set-capabilities-for-a-container',
      path: 'Tasks → Configure Pods → Security Context → Set capabilities',
      tip: 'securityContext goes under spec.containers[]. capabilities.add takes a list of strings. When recreating the pod, do NOT copy the auto-generated volumeMounts for service account tokens, those will fail.'
    },
    answer: {
      explanation: `<span class="highlight">Gotcha from your notes:</span> When you exported and re-applied the pod YAML, it included a volumeMount for a kube-api-access token. That volume doesn't exist in the new pod spec and caused an error. Strip auto-generated fields when recreating pods.`,
      yaml: `apiVersion: v1
kind: Pod
metadata:
  name: app-sec-kff3345
spec:
  containers:
  - name: ubuntu
    image: ubuntu
    command: ["sleep", "4800"]
    securityContext:
      runAsNonRoot: false      # allow root
      capabilities:
        add: ["SYS_TIME"]      # add capability
    # Do NOT include auto-generated volumeMounts from kubectl get -o yaml`
    }
  },

  // ── APP DEPLOYMENT ────────────────────────────────────────────────────────
  {
    id: 'dep-1', topic: 'deployment', difficulty: 'medium',
    title: 'RollingUpdate Deployment: maxSurge 1, maxUnavailable 2, then rollback',
    scenario: `Create Deployment <code>nginx-deploy</code> with 4 replicas, image <code>nginx:1.16</code>, RollingUpdate with maxSurge 1 and maxUnavailable 2. Upgrade to <code>nginx:1.17</code>. Once all pods are updated, roll back to the previous version.`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-update-deployment',
      path: 'Concepts → Deployments → Rolling Update Deployment',
      tip: 'strategy.type: RollingUpdate, then strategy.rollingUpdate.maxSurge and maxUnavailable. For rollback: "kubectl rollout undo deployment/<name>" goes back one revision.'
    },
    answer: {
      explanation: `Create with the strategy, update with set image, rollback with rollout undo.`,
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
    id: 'dep-2', topic: 'deployment', difficulty: 'hard',
    title: 'Blue/Green: route 70% traffic to blue, 30% to green using replica counts',
    scenario: `Create deployments <code>blue-apd</code> (image <code>webapp-color:v1</code>, label <code>type-one: blue</code>) and <code>green-apd</code> (image <code>webapp-color:v2</code>, label <code>type-two: green</code>). Both pods must have label <code>version: v1</code>. Create service <code>route-apd-svc</code> (NodePort, port 8080) selecting on <code>version: v1</code>. Route 70% to blue, 30% to green using replica counts (total = 10 pods).`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#scaling-a-deployment',
      path: 'Concepts → Deployments → Scaling a Deployment',
      tip: 'The service selects on the SHARED label (version: v1), not deployment-specific labels. Traffic splits proportionally to pod count. 70/30 = 7 blue replicas, 3 green replicas.'
    },
    answer: {
      explanation: `The shared label <code>version: v1</code> is the key. The service sees all 10 pods and routes randomly, eplica count controls the percentage.`,
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
    id: 'dep-3', topic: 'deployment', difficulty: 'hard',
    title: 'Canary: reduce new deployment below 40% traffic without increasing existing replicas',
    scenario: `Two deployments: <code>ruby-alpha-apd</code> (5 replicas) and <code>cube-alpha-apd</code> (5 replicas) both selected by service <code>alpha-apd-service</code>. Currently ~50% goes to each. Reduce traffic to <code>cube-alpha-apd</code> below 40%. Do NOT increase replicas of <code>ruby-alpha-apd</code>.`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#scaling-a-deployment',
      path: 'Concepts → Deployments → Scaling',
      tip: 'Total = 10 pods, 50/50 split. To get cube-alpha-apd below 40%, scale it down. With ruby at 5, cube needs to be ≤ 3 for cube to be ≤ 37.5% of total. Scale cube to 2: 2/7 = ~28.5%.'
    },
    answer: {
      explanation: `Math: ruby=5 fixed. For cube < 40%: cube/(5+cube) < 0.4 → cube < 3.33 → max cube=3. Scale to 2 for safety.`,
      yaml: `kubectl scale deployment cube-alpha-apd \\
  --replicas=2 \\
  -n alpha-ns-apd

# Verify: 2/(5+2) = 28.5%, well below 40%`
    }
  },
  {
    id: 'dep-4', topic: 'cka-helm', difficulty: 'hard',
    title: 'Helm: fix chart issues and install to specific namespace',
    scenario: `A Helm chart is at <code>/opt/webapp-color-apd/</code>. Fix these issues and install as release <code>webapp-color-apd</code> in namespace <code>frontend-apd</code>: (1) Deployment apiVersion is wrong, (2) service template has a typo in a variable, (3) appVersion should be 1.20.0, (4) replicaCount should be 3, (5) service type should be NodePort.`,
    hint: {
      url: 'https://helm.sh/docs/helm/helm_lint/',
      path: 'helm.sh → Helm Commands → helm lint',
      tip: 'Run "helm lint ./chart-dir" to find template errors before installing. Check Chart.yaml for appVersion, values.yaml for replicaCount and service.type. Template variables like {{ .Values.service.name }} are case-sensitive.'
    },
    answer: {
      explanation: `Always lint first. Create the namespace before installing.`,
      yaml: `# 1. Create namespace if needed
kubectl create ns frontend-apd

# 2. Lint to find errors
cd /opt
helm lint ./webapp-color-apd/
# will show: wrong apiVersion, typo in template variable

# 3. Fix Chart.yaml
#    appVersion: "1.20.0"

# 4. Fix values.yaml
#    replicaCount: 3
#    service:
#      type: NodePort

# 5. Fix templates/deployment.yaml
#    apiVersion: apps/v1  (not just v1)

# 6. Fix template variable typo in service.yaml
#    {{ .Values.service.name }}  (check exact casing)

# 7. Lint again to confirm clean
helm lint ./webapp-color-apd/

# 8. Install
helm install webapp-color-apd -n frontend-apd ./webapp-color-apd

# 9. Verify
helm ls -n frontend-apd`
    }
  },

  // ── MOCK EXAM 5 ───────────────────────────────────────────────────────────
  {
    id: 'me5-1', topic: 'cronjob', difficulty: 'medium',
    title: 'CronJob: print a message every hour, restartPolicy OnFailure',
    scenario: `In namespace <code>ckad-job</code> on <code>cluster2</code>, create a CronJob named <code>learning-every-hour</code> that runs every hour at minute 0 and prints: <code>I will pass CKAD certification</code>. Use image <code>alpine</code>. If the container fails for any reason, it should restart automatically.`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/',
      path: 'Concepts → Workload Management → CronJob',
      tip: '"Every hour at minute 0" = "0 * * * *" (first field is minutes). restartPolicy: OnFailure means the container will restart on non-zero exit, use this when you want automatic retry but not Always (which is invalid in Jobs).'
    },
    answer: {
      explanation: `<span class="highlight">restartPolicy choices in Jobs/CronJobs:</span> <code>Never</code> = don't restart, just mark failed. <code>OnFailure</code> = restart the container in-place if it exits non-zero. <code>Always</code> is NOT valid in Job/CronJob pods.`,
      yaml: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: learning-every-hour
  namespace: ckad-job
spec:
  schedule: "0 * * * *"       # minute 0 of every hour
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: learning-every-hour
            image: alpine
            imagePullPolicy: IfNotPresent
            command:
            - /bin/sh
            - -c
            - echo I will pass CKAD certification
          restartPolicy: OnFailure  # NOT Always, hat's invalid in Jobs`
    }
  },
  {
    id: 'me5-2', topic: 'deployment', difficulty: 'medium',
    title: 'kubectl set image + scale deployment + record new image to file via SSH',
    scenario: `Deployment <code>results-apd</code> runs in namespace <code>dashboard-apd</code> on <code>cluster2</code>. Update its container image to <code>nginx:1.23.3</code>. SSH into <code>cluster2-controlplane</code> and write the new image name to <code>/root/records/new-image-records.txt</code>. Then scale the deployment to 4 replicas.`,
    hint: {
      url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_set/kubectl_set_image/',
      path: 'Reference → kubectl → kubectl set image',
      tip: 'First use "kubectl describe deploy" to find the exact container name, you need it for set image. Syntax: kubectl set image deploy/<name> <container-name>=<image>. Then SSH to the node and use echo + redirect to write the file. Create the directory first if it doesn\'t exist.'
    },
    answer: {
      explanation: `Three distinct steps: update image, write record to file (requires SSH), scale. Finding the container name from describe is the step people miss.`,
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
    id: 'me5-3', topic: 'cka-helm', difficulty: 'medium',
    title: 'Helm: repo update then upgrade chart version and set replicaCount',
    scenario: `A Helm release named <code>lvm-crystal-apd</code> (nginx chart) is deployed on <code>cluster3</code> in namespace <code>crystal-apd-ns</code>. The team has pushed a new chart version. Update the Helm repo, then upgrade the release to chart version <code>18.1.15</code> with <code>replicaCount=2</code>. Do this on the <code>cluster3-controlplane</code> node.`,
    hint: {
      url: 'https://helm.sh/docs/helm/helm_upgrade/',
      path: 'helm.sh → Helm Commands → helm upgrade',
      tip: 'Always run "helm repo update" before upgrading to fetch the latest chart metadata, ithout it you may not see the new version. The --version flag pins the chart version (not the app version). --set overrides a single values.yaml key inline.'
    },
    answer: {
      explanation: `<span class="highlight">helm repo update is mandatory</span> before upgrading to a new version, it syncs the local index with the remote repo. Without it, Helm won't know the new version exists.`,
      yaml: `# SSH to the controlplane first
ssh cluster3-controlplane

# 1. Update repo cache
helm repo update

# 2. Upgrade with specific chart version and overridden value
helm upgrade lvm-crystal-apd lvm-crystal-apd/nginx \\
  --version=18.1.15 \\
  --namespace=crystal-apd-ns \\
  --set replicaCount=2

# 3. Verify
helm ls -n crystal-apd-ns
kubectl get pods -n crystal-apd-ns`
    }
  },
  {
    id: 'me5-4', topic: 'deployment', difficulty: 'medium',
    title: 'RBAC: Role restricted to a specific named ConfigMap instance',
    scenario: `Create a Role named <code>configmap-updater</code> in namespace <code>ckad21-auth2-aecs</code>. It should grant <code>update</code> and <code>get</code> permissions on <code>configmaps</code>, but ONLY for the specific ConfigMap named <code>ckad-cnfmp-aecs</code>, not all ConfigMaps.`,
    hint: {
      url: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/#referring-to-resources',
      path: 'Reference → RBAC Authorization → Referring to resources',
      tip: 'kubectl create role supports --resource-name to restrict a rule to a specific named instance of a resource. Without it, the role grants access to ALL configmaps. In YAML this maps to the "resourceNames" field in the rules list.'
    },
    answer: {
      explanation: `<span class="highlight">resourceNames</span> is the key field, it scopes the permission to a specific named resource instance. Without it, the role applies to all configmaps in the namespace.`,
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
  // ── MOCK EXAM 6 ───────────────────────────────────────────────────────────
  {
    id: 'me6-1', topic: 'design-build', difficulty: 'fail',
    title: 'Pod with init container + main container (both alpine)',
    scenario: `In namespace <code>ckad-multi-containers</code> on <code>cluster2</code>, create a pod named <code>static-web-server</code> with 2 containers, both using the <code>alpine</code> image.<br><br>
<strong>Init container</strong> (<code>init-myservice</code>): print <code>Getting main application ready!</code> then sleep <code>10</code> seconds.<br>
<strong>Main container</strong> (<code>server-container</code>): print <code>Main application is running</code> then sleep <code>3600</code> seconds.`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/workloads/pods/init-containers/',
      path: 'Concepts → Workloads → Pods → Init Containers',
      tip: 'Init containers go under spec.initContainers (list), main containers under spec.containers. Use command: [sh, -c, "echo ... && sleep N"] to chain the echo and sleep in one container command.'
    },
    answer: {
      explanation: `Init containers run to completion before main containers start. They live under <code>spec.initContainers</code>. Chain the echo and sleep with <code>&amp;&amp;</code> inside <code>sh -c</code>.`,
      yaml: `kubectl config use-context cluster2

apiVersion: v1
kind: Pod
metadata:
  name: static-web-server
  namespace: ckad-multi-containers
  labels:
    app.kubernetes.io/name: static-web-server
spec:
  containers:
  - name: server-container
    image: alpine
    command:
    - sh
    - -c
    - echo Main application is running && sleep 3600
  initContainers:
  - name: init-myservice
    image: alpine
    command:
    - sh
    - -c
    - echo Getting main application ready! && sleep 10`
    }
  },
  {
    id: 'me6-2', topic: 'network-policy', difficulty: 'fail',
    title: 'Troubleshoot: service selector mismatch + overly restrictive egress NetworkPolicy',
    scenario: `In namespace <code>ns-new-ckad</code> on <code>cluster3</code>, two issues exist:<br><br>
<strong>Issue 1:</strong> <code>backend-ckad-svcn</code> cannot reach backend pods. Inspect and fix the service selector.<br>
<strong>Issue 2:</strong> <code>frontend-ckad-svcn</code> is not accessible from backend pods. A NetworkPolicy <code>backend-egress-restricted</code> is blocking traffic, fix it so backends can reach all egress destinations (not just frontend).`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/#egress',
      path: 'Concepts → Network Policies → Egress',
      tip: 'For Issue 1: kubectl describe svc backend-ckad-svcn, compare selector labels to actual pod labels (kubectl get pods --show-labels). For Issue 2: kubectl edit netpol backend-egress-restricted, replace the restrictive "to:" egress rule with an empty {} to allow all egress.'
    },
    answer: {
      explanation: `<span class="highlight">Issue 1:</span> Service selector used <code>app: back-end, tier: ckadexam</code> but pods have <code>app: backend, tier: ckad-exam</code>. Fix with kubectl edit svc. <span class="highlight">Issue 2:</span> Replace the to: podSelector egress rule with an empty <code>- {}</code> to allow all egress.`,
      yaml: `# === Issue 1: Fix service selector ===
kubectl -n ns-new-ckad describe svc backend-ckad-svcn
# Selector shows: app=back-end, ier=ckadexam  ← WRONG
kubectl -n ns-new-ckad get pods --show-labels
# Pods have: app=backend, ier=ckad-exam

kubectl -n ns-new-ckad edit svc backend-ckad-svcn
# Change selector to:
#   selector:
#     app: backend      # match actual pod label
#     tier: ckad-exam   # match actual pod label

# Verify:
kubectl -n ns-new-ckad exec testpod -- curl backend-ckad-svcn

# === Issue 2: Fix egress NetworkPolicy ===
kubectl -n ns-new-ckad edit netpol backend-egress-restricted
# Replace the restrictive egress block:
#   egress:
#   - to:
#     - podSelector:
#         matchLabels:
#           app: frontend
#           tier: ckad-exam
# With a permissive allow-all:
#   egress:
#   - {}   # allow ALL egress`
    }
  },
  {
    id: 'me6-3', topic: 'services', difficulty: 'fail',
    title: 'ClusterIP service with shared label selectors; list all pod IPs sorted',
    scenario: `On <code>cluster2</code>. Two parts:<br><br>
<strong>Part I:</strong> Several pods exist in the default namespace. Create a ClusterIP service named <code>radioactive-service</code> exposing pods <code>beta</code> and <code>gamma</code> only. Port <code>8080</code>, targetPort <code>80</code>. Identify the labels that are common to beta and gamma (not shared by others) and use those as selectors.<br><br>
<strong>Part II:</strong> Store the pod name and IP of <strong>all pods across all namespaces</strong> to <code>/root/pod_ips_ckad02_svcn</code>, sorted by IP. Format:<br><code>POD_NAME&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IP_ADDR</code>`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/service/',
      path: 'Concepts → Services, LB & Networking → Service',
      tip: 'Part I: kubectl get pods --show-labels, find labels UNIQUE to beta+gamma. Then kubectl create service clusterip radioactive-service --tcp=8080:80 --dry-run=client -o yaml > svc.yaml, edit the selector, apply. Part II: kubectl get pods -A -o=custom-columns=\'POD_NAME:metadata.name,IP_ADDR:status.podIP\' --sort-by=.status.podIP'
    },
    answer: {
      explanation: `<span class="highlight">Key insight:</span> Use <code>kubectl get pods --show-labels</code> to spot that only beta and gamma share <code>mode=exam,type=external</code>. Dry-run generates the service YAML, then edit the selector before applying. For Part II, <code>custom-columns</code> with <code>--sort-by</code> is the exam-fast approach.`,
      yaml: `# === Part I ===
kubectl config use-context cluster2

# Find the discriminating labels for beta + gamma only:
kubectl get pods --show-labels
# beta:  env=dev,mode=exam,type=external
# gamma: env=prod,mode=exam,type=external
# Common unique labels: mode=exam,type=external

# Confirm only those two pods match:
kubectl get pods -l mode=exam,type=external

# Generate service YAML:
kubectl create service clusterip radioactive-service \\
  --tcp=8080:80 --dry-run=client -o yaml > radioactive-service.yaml

# Edit radioactive-service.yaml, change selector to:
#   selector:
#     mode: exam       # replaces default app: radioactive-service
#     type: external

kubectl apply -f radioactive-service.yaml

# Verify endpoints (should show 2 pod IPs):
kubectl get ep radioactive-service

# === Part II ===
kubectl get pods -A \\
  -o=custom-columns='POD_NAME:metadata.name,IP_ADDR:status.podIP' \\
  --sort-by=.status.podIP > /root/pod_ips_ckad02_svcn`
    }
  },
  {
    id: 'me6-4', topic: 'design-build', difficulty: 'fail',
    title: 'CRD with openAPIV3Schema validation: string fields, integer min/max, Namespaced scope',
    scenario: `On <code>cluster2</code>, a CRD file exists at <code>/root/ckad19-crd-aecs.yaml</code>. Add the following validation schema and set scope to <code>Namespaced</code>, then create it:<br><br>
• <code>destinationName</code>, <code>country</code>, <code>city</code>, type: <code>string</code><br>
• <code>pricePerNight</code>, type: <code>integer</code>, minimum: <code>50</code>, maximum: <code>5000</code><br>
• <code>durationInDays</code>, type: <code>integer</code>, minimum: <code>1</code>, maximum: <code>30</code>`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#validation',
      path: 'Tasks → Extend Kubernetes → CRDs → Validation',
      tip: 'The schema goes under spec.versions[].schema.openAPIV3Schema. Structure: type: object → properties: spec: → type: object → properties: (your fields). scope: Namespaced goes under spec.scope. Apply with kubectl create -f (not apply); create fails loudly if the schema is wrong.'
    },
    answer: {
      explanation: `Schema validation nests under <code>spec.versions[].schema.openAPIV3Schema.properties.spec.properties</code>. Each integer field gets <code>minimum</code> and <code>maximum</code>. Don't forget <code>scope: Namespaced</code> under <code>spec</code>.`,
      yaml: `kubectl config use-context cluster2

# Edit /root/ckad19-crd-aecs.yaml, add under spec.versions[].schema:
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: holidaydestinations.destinations.k8s.io
spec:
  group: destinations.k8s.io
  scope: Namespaced          # <-- set this
  names:
    kind: HolidayDestination
    singular: holidaydestination
    plural: holidaydestinations
    shortNames: [hd]
  versions:
  - name: v1alpha1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              destinationName:
                type: string
              country:
                type: string
              city:
                type: string
              pricePerNight:
                type: integer
                minimum: 50
                maximum: 5000
              durationInDays:
                type: integer
                minimum: 1
                maximum: 30

kubectl create -f /root/ckad19-crd-aecs.yaml`
    }
  },
  {
    id: 'me6-5', topic: 'observability', difficulty: 'fail',
    title: 'Get logs from a named sidecar container and redirect to a file',
    scenario: `On <code>cluster1</code>, a pod named <code>log-generator-pod</code> runs in the default namespace. It has two containers. Get the logs of the <code>sidecar</code> container and save them to <code>/root/ckad21-exam.txt</code> on the student node.`,
    hint: {
      url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_logs/',
      path: 'Reference → kubectl → kubectl logs',
      tip: 'Use kubectl logs <pod> -c <container-name> to target a specific container. Redirect with > to write to a file. If unsure of container names: kubectl get pod log-generator-pod -o jsonpath=\'{.spec.containers[*].name}\''
    },
    answer: {
      explanation: `When a pod has multiple containers, <code>kubectl logs</code> requires <code>-c &lt;container&gt;</code> to target the right one. Redirect output with <code>&gt;</code> to store it.`,
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
    id: 'me5-5', topic: 'observability', difficulty: 'hard',
    title: 'Debug pod stuck in Init:StartError, fix missing shell interpreter in init container command',
    scenario: `Pod <code>ckad-frontend-pod</code> in namespace <code>ckad-21-production</code> on <code>cluster3</code> is stuck in <code>Init:StartError</code>. Find the root cause and fix it to bring the pod to Running state.`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/debug/debug-application/debug-init-containers/',
      path: 'Tasks → Debug Applications → Debug Init Containers',
      tip: 'Init:StartError means the init container process failed to start, the binary or interpreter doesn\'t exist or wasn\'t specified. Run "kubectl describe pod" and look at the init container\'s Last State / Message. Then get the pod YAML and check the command field, if you have a shell command without /bin/sh -c, the container can\'t run it.'
    },
    answer: {
      explanation: `The init container had a shell command without the <code>/bin/sh -c</code> interpreter prefix. The container runtime tried to execute the string directly as a binary, hich fails. Fix: prepend <code>/bin/sh</code> and <code>-c</code> to the command list.`,
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
  },

  // ════════════════════════ CKA QUESTIONS ════════════════════════════════════

  // ── CKA: ETCD BACKUP & RESTORE ────────────────────────────────────────────
  {
    id: 'cka-etcd-1', topic: 'cka-etcd', difficulty: 'fail',
    title: 'Backup etcd to /opt/etcd-backup.db on the controlplane',
    scenario: `Take a snapshot backup of etcd at <code>/opt/etcd-backup.db</code> on the controlplane node using <code>etcdctl</code> v3 API. The TLS certs live under <code>/etc/kubernetes/pki/etcd/</code>.`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/#backing-up-an-etcd-cluster',
      path: 'Tasks → Administer a Cluster → Operating etcd → Backing up an etcd cluster',
      tip: 'Search "backup etcd cluster", copy the snapshot save command. The exam wants: ETCDCTL_API=3 etcdctl snapshot save <path> --endpoints --cacert --cert --key. If unsure of cert paths, look in /etc/kubernetes/manifests/etcd.yaml.'
    },
    answer: {
      explanation: `<span class="highlight">Memorize this one-liner.</span> All three TLS flags are mandatory or the snapshot save hangs. The cert paths come from the etcd static pod manifest.`,
      yaml: `# Always set v3 API
export ETCDCTL_API=3

# Snapshot save (the one-liner to memorize):
etcdctl snapshot save /opt/etcd-backup.db \\
  --endpoints=127.0.0.1:2379 \\
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\
  --cert=/etc/kubernetes/pki/etcd/server.crt \\
  --key=/etc/kubernetes/pki/etcd/server.key

# Verify the snapshot
etcdctl --write-out=table snapshot status /opt/etcd-backup.db

# If you don't know the cert paths, find them in the manifest:
grep -E '(cert|key|ca)-file' /etc/kubernetes/manifests/etcd.yaml`
    }
  },
  {
    id: 'cka-etcd-2', topic: 'cka-etcd', difficulty: 'hard',
    title: 'Restore etcd from a snapshot to a new data dir',
    scenario: `An etcd snapshot exists at <code>/opt/snapshot.db</code>. Restore it into <code>/var/lib/etcd-from-backup</code>, then update the static pod manifest at <code>/etc/kubernetes/manifests/etcd.yaml</code> so etcd uses the restored data. Verify cluster recovers.`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/#restoring-an-etcd-cluster',
      path: 'Tasks → Administer a Cluster → Operating etcd → Restoring an etcd cluster',
      tip: 'Two parts: (1) etcdctl snapshot restore --data-dir=<new-dir> creates the dir. (2) Edit /etc/kubernetes/manifests/etcd.yaml, change BOTH the --data-dir command arg AND the volumes.hostPath.path that mounts /var/lib/etcd. The kubelet auto-restarts the pod when the manifest changes.'
    },
    answer: {
      explanation: `Two locations to update in the manifest: the <code>--data-dir</code> arg AND the <code>hostPath</code> volume. Miss either one and etcd reads the wrong data.`,
      yaml: `# 1. Restore the snapshot to a new data dir
ETCDCTL_API=3 etcdctl snapshot restore /opt/snapshot.db \\
  --data-dir=/var/lib/etcd-from-backup

# 2. Edit the static pod manifest
vi /etc/kubernetes/manifests/etcd.yaml

# Update TWO places:
#   spec:
#     containers:
#     - command:
#       - etcd
#       - --data-dir=/var/lib/etcd-from-backup    <-- (was /var/lib/etcd)
#     volumes:
#     - hostPath:
#         path: /var/lib/etcd-from-backup         <-- (was /var/lib/etcd)
#         type: DirectoryOrCreate
#       name: etcd-data

# 3. Kubelet detects the change and restarts etcd
# Wait ~30s, then verify:
kubectl get pods -n kube-system | grep etcd
kubectl get nodes`
    }
  },
  {
    id: 'cka-etcd-3', topic: 'cka-etcd', difficulty: 'medium',
    title: 'Find the current etcd data dir + cert paths from a running cluster',
    scenario: `You SSH into a brand new cluster's controlplane and need to back up etcd, but you don't know its data dir or cert locations. Find both, then take a snapshot to <code>/opt/cluster-backup.db</code>.`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/#backing-up-an-etcd-cluster',
      path: 'Tasks → Administer a Cluster → Operating etcd',
      tip: 'For kubeadm clusters, etcd runs as a static pod, its config lives in /etc/kubernetes/manifests/etcd.yaml. grep for "data-dir", "cert-file", "key-file", "trusted-ca-file" to extract every path.'
    },
    answer: {
      explanation: `Always find paths from the live manifest, on't assume defaults. Different distros put certs in different places.`,
      yaml: `# Inspect the running etcd static pod manifest
cat /etc/kubernetes/manifests/etcd.yaml | grep -E '(data-dir|cert-file|key-file|trusted-ca-file|listen-client-urls)'

# Typical output (kubeadm):
#   --cert-file=/etc/kubernetes/pki/etcd/server.crt
#   --key-file=/etc/kubernetes/pki/etcd/server.key
#   --trusted-ca-file=/etc/kubernetes/pki/etcd/ca.crt
#   --data-dir=/var/lib/etcd
#   --listen-client-urls=https://127.0.0.1:2379, ttps://10.x.x.x:2379

# Take the snapshot
ETCDCTL_API=3 etcdctl snapshot save /opt/cluster-backup.db \\
  --endpoints=127.0.0.1:2379 \\
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\
  --cert=/etc/kubernetes/pki/etcd/server.crt \\
  --key=/etc/kubernetes/pki/etcd/server.key`
    }
  },

  // ── CKA: JSONPATH & CUSTOM COLUMNS ────────────────────────────────────────
  {
    id: 'cka-jp-1', topic: 'cka-jsonpath', difficulty: 'fail',
    title: 'List deployments as table: NAME, IMAGE, READY, NAMESPACE, sorted by name',
    scenario: `Print the deployments in namespace <code>admin2406</code> in this format and write to <code>/opt/admin2406_data</code>:<br><br>
<code>DEPLOYMENT&nbsp;&nbsp;&nbsp;CONTAINER_IMAGE&nbsp;&nbsp;&nbsp;READY_REPLICAS&nbsp;&nbsp;&nbsp;NAMESPACE</code><br>
<code>deploy0&nbsp;&nbsp;&nbsp;nginx:alpine&nbsp;&nbsp;&nbsp;1&nbsp;&nbsp;&nbsp;admin2406</code><br><br>
Sort by deployment name ascending.`,
    hint: {
      url: 'https://kubernetes.io/docs/reference/kubectl/quick-reference/',
      path: 'Reference → kubectl Cheat Sheet (search "custom-columns")',
      tip: 'Pattern: kubectl get <kind> -o custom-columns=<HEADER>:.<jsonpath>,<HEADER>:.<jsonpath> --sort-by=<jsonpath>. The cheat sheet has copy-paste examples, quicker than the JSONPath reference.'
    },
    answer: {
      explanation: `<span class="highlight">Memorize this pattern.</span> The container image path uses <code>[]</code> (no index = first container). The <code>--sort-by</code> flag goes outside the custom-columns string. No spaces between fields, kubectl rejects them.`,
      yaml: `kubectl -n admin2406 get deployment \\
  -o custom-columns=DEPLOYMENT:.metadata.name,CONTAINER_IMAGE:.spec.template.spec.containers[].image,READY_REPLICAS:.status.readyReplicas,NAMESPACE:.metadata.namespace \\
  --sort-by=.metadata.name \\
  > /opt/admin2406_data

# Verify formatting
cat /opt/admin2406_data

# Memorize these jsonpaths (no leading dot inside custom-columns):
#   .metadata.name
#   .metadata.namespace
#   .spec.template.spec.containers[].image     <-- [] means "all", first by default
#   .status.readyReplicas`
    }
  },
  {
    id: 'cka-jp-2', topic: 'cka-jsonpath', difficulty: 'medium',
    title: 'Get all pod IPs across all namespaces sorted by IP',
    scenario: `Write all pod names and pod IPs (across all namespaces) to <code>/root/pod_ips.txt</code>, sorted ascending by IP. Format: <code>POD_NAME&nbsp;&nbsp;&nbsp;&nbsp;IP_ADDR</code>.`,
    hint: {
      url: 'https://kubernetes.io/docs/reference/kubectl/generated/kubectl_get/',
      path: 'Reference → kubectl → kubectl get',
      tip: '-A means all namespaces. --sort-by takes a jsonpath WITH leading dot. custom-columns paths do NOT have leading dot.'
    },
    answer: {
      explanation: `Two gotchas: <code>--sort-by</code> needs a leading dot, but the paths inside <code>custom-columns</code> do not.`,
      yaml: `kubectl get pods -A \\
  -o=custom-columns='POD_NAME:metadata.name,IP_ADDR:status.podIP' \\
  --sort-by=.status.podIP \\
  > /root/pod_ips.txt

# Inspect:
head -5 /root/pod_ips.txt`
    }
  },
  {
    id: 'cka-jp-3', topic: 'cka-jsonpath', difficulty: 'medium',
    title: 'JSONPath: extract a single field with -o jsonpath',
    scenario: `Print just the container image of the pod <code>nginx</code> in the default namespace. Then print the names of all nodes in a space-separated list.`,
    hint: {
      url: 'https://kubernetes.io/docs/reference/kubectl/jsonpath/',
      path: 'Reference → kubectl → JSONPath Support',
      tip: 'jsonpath uses {} brackets around the expression. {.spec.containers[0].image} for one image. {range .items[*]}{.metadata.name}{" "}{end} to iterate.'
    },
    answer: {
      explanation: `JSONPath wraps the expression in <code>{}</code>. <code>range</code> + <code>end</code> iterates a list. The single-quote around the whole expression keeps shell from eating the braces.`,
      yaml: `# Single field
kubectl get pod nginx -o jsonpath='{.spec.containers[0].image}'

# Iterate over a list (all node names, space-separated)
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{" "}{end}'

# Multi-field with literals
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\\t"}{.status.podIP}{"\\n"}{end}'

# All container images in cluster, deduped (common interview/exam question)
kubectl get pods -A -o jsonpath='{.items[*].spec.containers[*].image}' | tr ' ' '\\n' | sort -u`
    }
  },

  // ── CKA: KUBEADM CLUSTER UPGRADES ─────────────────────────────────────────
  {
    id: 'cka-up-1', topic: 'cka-upgrade', difficulty: 'hard',
    title: 'Upgrade controlplane from v1.34 to v1.35 with kubeadm',
    scenario: `Upgrade the controlplane node from <code>v1.34.0</code> to <code>v1.35.0</code> using kubeadm. Drain the controlplane first. After upgrade, uncordon. Do not touch worker nodes yet.`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/',
      path: 'Tasks → Administer a Cluster → kubeadm → Upgrading kubeadm clusters',
      tip: 'Use the version-pinned doc URL: v1-35.docs.kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/. The apt sources line MUST match your target minor (pkgs.k8s.io/core:/stable:/v1.35/deb/). Sequence: drain → unhold → install kubeadm → upgrade plan → upgrade apply → install kubelet+kubectl → daemon-reload → restart kubelet → uncordon.'
    },
    answer: {
      explanation: `<span class="highlight">Two easy-to-miss steps:</span> (1) update <code>/etc/apt/sources.list.d/kubernetes.list</code> to the new minor version's repo before <code>apt update</code>. (2) <code>apt-mark unhold</code> kubeadm/kubelet/kubectl before install, then <code>apt-mark hold</code> after.`,
      yaml: `# 1. Drain the controlplane
kubectl drain controlplane --ignore-daemonsets

# 2. Update the apt repo to the target minor
# Edit /etc/apt/sources.list.d/kubernetes.list, change v1.34 to v1.35:
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.35/deb/ /' \\
  | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt update
sudo apt-cache madison kubeadm   # confirm 1.35.0-1.1 is available

# 3. Upgrade kubeadm itself
sudo apt-mark unhold kubeadm
sudo apt-get install -y kubeadm='1.35.0-1.1'
sudo apt-mark hold kubeadm
kubeadm version

# 4. Plan + apply (only on FIRST controlplane)
sudo kubeadm upgrade plan
sudo kubeadm upgrade apply v1.35.0

# 5. Upgrade kubelet + kubectl
sudo apt-mark unhold kubelet kubectl
sudo apt-get install -y kubelet='1.35.0-1.1' kubectl='1.35.0-1.1'
sudo apt-mark hold kubelet kubectl

# 6. Restart kubelet
sudo systemctl daemon-reload
sudo systemctl restart kubelet

# 7. Uncordon
kubectl uncordon controlplane
kubectl get nodes   # controlplane should show v1.35.0 Ready`
    }
  },
  {
    id: 'cka-up-2', topic: 'cka-upgrade', difficulty: 'medium',
    title: 'Upgrade a worker node and reschedule a deployment to controlplane during downtime',
    scenario: `Worker <code>node01</code> needs to be upgraded to v1.35.0. Before draining, reschedule the <code>gold-nginx</code> deployment so it ends up on the controlplane (which has been freshly upgraded and uncordoned). Use a node selector or affinity to pin it. Then drain node01 and upgrade.`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/#upgrade-worker-nodes',
      path: 'Tasks → Administer a Cluster → kubeadm → Upgrade worker nodes',
      tip: 'On worker nodes the command is "kubeadm upgrade node" (NOT "upgrade apply"). Before draining: edit the deployment to add a nodeSelector pointing to controlplane (label kubernetes.io/hostname=controlplane). Pods will reschedule, then drain is safe.'
    },
    answer: {
      explanation: `Worker upgrade uses <code>kubeadm upgrade node</code> (no plan/apply). Pin the deployment to controlplane with a nodeSelector before draining so it doesn't go pending.`,
      yaml: `# 1. Pin gold-nginx to controlplane BEFORE draining node01
kubectl edit deploy gold-nginx
# Under spec.template.spec, add:
#   nodeSelector:
#     kubernetes.io/hostname: controlplane
# (or use --overrides / kubectl patch)

# Verify pods reschedule:
kubectl get pods -o wide

# 2. Drain node01
kubectl drain node01 --ignore-daemonsets

# 3. SSH to node01 and upgrade kubeadm
ssh node01
sudo apt-mark unhold kubeadm
sudo apt-get install -y kubeadm='1.35.0-1.1'
sudo apt-mark hold kubeadm

# 4. Worker uses "upgrade node" (NOT plan/apply)
sudo kubeadm upgrade node

# 5. Upgrade kubelet + kubectl
sudo apt-mark unhold kubelet kubectl
sudo apt-get install -y kubelet='1.35.0-1.1' kubectl='1.35.0-1.1'
sudo apt-mark hold kubelet kubectl
sudo systemctl daemon-reload
sudo systemctl restart kubelet
exit

# 6. Uncordon node01
kubectl uncordon node01
kubectl get nodes`
    }
  },

  // ── CKA: STATIC PODS ──────────────────────────────────────────────────────
  {
    id: 'cka-sp-1', topic: 'cka-static-pod', difficulty: 'hard',
    title: 'Create a static pod nginx-critical on cluster1-node01',
    scenario: `Create a static pod called <code>nginx-critical</code> with image <code>nginx</code> on <code>cluster1-node01</code>. It must restart automatically on failure. Use <code>/etc/kubernetes/manifests</code> as the static pod path.`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/',
      path: 'Tasks → Configure Pods and Containers → Create static Pods',
      tip: 'Generate the pod YAML with --dry-run=client on the controlplane, scp it to the node, then drop it into /etc/kubernetes/manifests/. The kubelet picks it up automatically. Verify staticPodPath in /var/lib/kubelet/config.yaml. The mirror pod name will be nginx-critical-cluster1-node01.'
    },
    answer: {
      explanation: `Static pods are managed directly by the kubelet on the node, ot the API server. The kubelet creates a "mirror pod" in the API for visibility. Filename in <code>/etc/kubernetes/manifests/</code> doesn't have to match the pod name.`,
      yaml: `# 1. Generate the pod YAML on the controlplane
kubectl run nginx-critical --image=nginx \\
  --dry-run=client -o yaml > static.yaml

# 2. Copy to the node
scp static.yaml cluster1-node01:/root/

# 3. SSH to the node
ssh cluster1-node01

# 4. (If needed) confirm kubelet's staticPodPath
grep staticPodPath /var/lib/kubelet/config.yaml
# Expected: staticPodPath: /etc/kubernetes/manifests

# 5. Move the manifest into the static pod dir
sudo mkdir -p /etc/kubernetes/manifests
sudo cp /root/static.yaml /etc/kubernetes/manifests/

# 6. Verify (back on controlplane)
exit
kubectl get pods -A | grep nginx-critical
# Mirror pod name: nginx-critical-cluster1-node01`
    }
  },
  {
    id: 'cka-sp-2', topic: 'cka-static-pod', difficulty: 'easy',
    title: 'Find the staticPodPath on a node and list all static pods',
    scenario: `On a node, find which directory is configured as the kubelet's static pod path, then list every static pod manifest in it.`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/',
      path: 'Tasks → Configure Pods → Create static Pods',
      tip: 'Two places to check: (1) /var/lib/kubelet/config.yaml has staticPodPath. (2) systemd unit overrides may pass --pod-manifest-dir. ps -ef | grep kubelet shows the actual flags being used.'
    },
    answer: {
      explanation: `Always confirm via the running kubelet process, the config file may be overridden.`,
      yaml: `# Method 1: kubelet config file
grep staticPodPath /var/lib/kubelet/config.yaml

# Method 2: running process flags (shows overrides)
ps -ef | grep kubelet | grep -oE 'pod-manifest-dir[^ ]+'
# or
systemctl cat kubelet | grep -i manifest

# List the static pod manifests
ls -la /etc/kubernetes/manifests/
# kube-apiserver.yaml, kube-controller-manager.yaml, kube-scheduler.yaml, etcd.yaml`
    }
  },

  // ── CKA: CSR & RBAC USERS ─────────────────────────────────────────────────
  {
    id: 'cka-csr-1', topic: 'cka-csr-rbac', difficulty: 'hard',
    title: 'Create CSR john-developer, approve it, and grant Pod CRUD in development namespace',
    scenario: `Create a user <code>john</code>. Use the existing key/csr at <code>/root/CKA/john.key</code> and <code>/root/CKA/john.csr</code>. Create a CSR named <code>john-developer</code> with signerName <code>kubernetes.io/kube-apiserver-client</code>, approve it, then create a Role <code>developer</code> granting <strong>create, list, get, update, delete</strong> on pods in the <code>development</code> namespace, and bind it to john.`,
    hint: {
      url: 'https://kubernetes.io/docs/reference/access-authn-authz/certificate-signing-requests/',
      path: 'Reference → Access, Authn, Authz → Certificate Signing Requests',
      tip: 'The "request" field is the .csr file contents base64-encoded ON ONE LINE. Use: cat /root/CKA/john.csr | base64 -w 0. Then: kubectl certificate approve john-developer. Then: kubectl create role/rolebinding imperatively.'
    },
    answer: {
      explanation: `<span class="highlight">Three steps, exam-fast:</span> base64-encode the CSR (<code>-w 0</code> = no line wrap), apply the CSR YAML, approve, then create role + binding imperatively.`,
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
    id: 'cka-csr-2', topic: 'cka-csr-rbac', difficulty: 'medium',
    title: 'Restrict a Role to a single named ConfigMap',
    scenario: `Create a Role <code>configmap-updater</code> in namespace <code>secure-ns</code> that grants <code>get, update</code> on configmaps, but ONLY for the configmap named <code>app-config</code>. Bind it to user <code>maint</code>.`,
    hint: {
      url: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/#referring-to-resources',
      path: 'Reference → RBAC Authorization → Referring to resources',
      tip: 'kubectl create role supports --resource-name to scope a rule to a specific named instance. In the YAML this maps to "resourceNames" inside the rule.'
    },
    answer: {
      explanation: `<code>resourceNames</code> is the magic field, ithout it the Role applies to all configmaps in the namespace.`,
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

  // ── CKA: DNS & SERVICE DISCOVERY ──────────────────────────────────────────
  {
    id: 'cka-dns-1', topic: 'cka-dns', difficulty: 'medium',
    title: 'nslookup a Service from inside the cluster, save output to a file',
    scenario: `Create a pod <code>nginx-resolver</code> (image <code>nginx</code>), expose it as <code>nginx-resolver-service</code> (ClusterIP, port 80). From a temporary <code>busybox:1.28</code> pod, nslookup the service name and write the output to <code>/root/CKA/nginx.svc</code>. Then look up the pod by its IP and write to <code>/root/CKA/nginx.pod</code>.`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/',
      path: 'Concepts → Services, LB & Networking → DNS for Services and Pods',
      tip: 'Use busybox:1.28 specifically, ewer busybox images break nslookup against CoreDNS. Pod DNS form: <a-b-c-d>.<ns>.pod.cluster.local (dashes, NOT dots, in the IP). Use kubectl run --rm -it --restart=Never to get a one-shot pod.'
    },
    answer: {
      explanation: `<span class="highlight">Two gotchas:</span> (1) busybox >1.28 has a broken nslookup. (2) Pod DNS uses dashes in the IP and namespace.pod, while service uses service.namespace.svc.`,
      yaml: `# 1. Create the resolver pod + ClusterIP service
kubectl run nginx-resolver --image=nginx
kubectl expose pod nginx-resolver \\
  --name=nginx-resolver-service --port=80 --target-port=80 --type=ClusterIP

# 2. Look up by service name
kubectl run test-nslookup --image=busybox:1.28 --rm -it --restart=Never \\
  -- nslookup nginx-resolver-service > /root/CKA/nginx.svc

# 3. Get the pod IP and convert dots to dashes
POD_IP=$(kubectl get pod nginx-resolver -o jsonpath='{.status.podIP}')
DASHED=$(echo $POD_IP | tr '.' '-')

# 4. Look up by pod DNS (dashed IP + .default.pod)
kubectl run test-nslookup --image=busybox:1.28 --rm -it --restart=Never \\
  -- nslookup $DASHED.default.pod > /root/CKA/nginx.pod

# DNS forms:
#   Service: <svc>.<ns>.svc.cluster.local
#   Pod:     <a-b-c-d>.<ns>.pod.cluster.local`
    }
  },
  {
    id: 'cka-dns-2', topic: 'cka-dns', difficulty: 'easy',
    title: 'Debug: pod cannot resolve service name (CoreDNS sanity check)',
    scenario: `A pod cannot resolve <code>my-service</code>. Confirm CoreDNS is healthy and the pod's <code>/etc/resolv.conf</code> points at the cluster DNS service.`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/',
      path: 'Tasks → Administer a Cluster → Debugging DNS Resolution',
      tip: 'Three checks: (1) CoreDNS pods Running in kube-system. (2) kube-dns service has endpoints. (3) Pod\'s /etc/resolv.conf nameserver is the kube-dns ClusterIP.'
    },
    answer: {
      explanation: `Walk the chain: CoreDNS pods → kube-dns service → pod resolv.conf. Any broken link breaks DNS.`,
      yaml: `# 1. CoreDNS pods healthy?
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=20

# 2. kube-dns service has endpoints?
kubectl get svc -n kube-system kube-dns
kubectl get endpoints -n kube-system kube-dns

# 3. From inside any pod, what DNS server is it using?
kubectl exec <pod> -- cat /etc/resolv.conf
# Expected:
#   nameserver 10.96.0.10           # kube-dns ClusterIP
#   search default.svc.cluster.local svc.cluster.local cluster.local

# 4. Test resolution from the same pod
kubectl exec <pod> -- nslookup my-service
kubectl exec <pod> -- nslookup kubernetes.default`
    }
  },

  // ── CKA: CNI NETWORKING ───────────────────────────────────────────────────
  {
    id: 'cka-cni-1', topic: 'cka-cni', difficulty: 'hard',
    title: 'Install Calico CNI with a custom pod CIDR (172.17.0.0/16)',
    scenario: `Install Calico on a fresh cluster using the tigera operator. Override the default IP pool to use CIDR <code>172.17.0.0/16</code>. Verify pods can communicate after install.`,
    hint: {
      url: 'https://docs.tigera.io/calico/latest/getting-started/kubernetes/quickstart',
      path: 'docs.tigera.io → Calico → Quickstart for Kubernetes',
      tip: 'Two manifests: tigera-operator.yaml (the operator itself) + custom-resources.yaml (the Installation CR with your CIDR). Use kubectl create (NOT apply) on tigera-operator.yaml, pply hits a 262144-byte annotation limit. Edit the CIDR in custom-resources.yaml before applying.'
    },
    answer: {
      explanation: `<span class="highlight">The "kubectl apply" trap:</span> tigera-operator.yaml has a CRD with annotations that exceed apply's 262144-byte limit. Use <code>kubectl create -f</code> instead.`,
      yaml: `# 1. Install the operator (use create, not apply)
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.29.2/manifests/tigera-operator.yaml

# 2. Download the Installation CR
curl -O https://raw.githubusercontent.com/projectcalico/calico/v3.29.2/manifests/custom-resources.yaml

# 3. Edit custom-resources.yaml, change the cidr:
# spec:
#   calicoNetwork:
#     ipPools:
#     - name: default-ipv4-ippool
#       blockSize: 26
#       cidr: 172.17.0.0/16              <-- CHANGE THIS
#       encapsulation: VXLANCrossSubnet
#       natOutgoing: Enabled
#       nodeSelector: all()

# 4. Apply the Installation CR (this one is small, apply works)
kubectl create -f custom-resources.yaml

# 5. Watch Calico come up (takes 1-2 minutes)
watch kubectl get pods -n calico-system

# 6. Test pod-to-pod
kubectl run web --image=nginx
WEB_IP=$(kubectl get pod web -o jsonpath='{.status.podIP}')
kubectl run test --rm -it --image=nicolaka/netshoot --restart=Never -- curl $WEB_IP`
    }
  },

  // ── CKA: GATEWAY API ──────────────────────────────────────────────────────
  {
    id: 'cka-gw-1', topic: 'cka-gateway', difficulty: 'medium',
    title: 'Create a Gateway with HTTP listener on port 80',
    scenario: `Create a Gateway resource:<br>• name: <code>web-gateway</code><br>• namespace: <code>nginx-gateway</code><br>• gatewayClassName: <code>nginx</code><br>• Listener: protocol HTTP, port 80, name <code>http</code>`,
    hint: {
      url: 'https://gateway-api.sigs.k8s.io/api-types/gateway/',
      path: 'gateway-api.sigs.k8s.io → API Types → Gateway',
      tip: 'apiVersion: gateway.networking.k8s.io/v1. Gateway has spec.gatewayClassName + spec.listeners[]. A listener needs name, protocol, port (and tls/hostname when needed).'
    },
    answer: {
      explanation: `Minimal Gateway: a class name and one listener. Each listener needs a unique <code>name</code>.`,
      yaml: `apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: web-gateway
  namespace: nginx-gateway
spec:
  gatewayClassName: nginx
  listeners:
  - name: http
    protocol: HTTP
    port: 80

# Apply and verify the gateway is ACCEPTED
kubectl apply -f gateway.yaml
kubectl get gateway -n nginx-gateway
kubectl describe gateway web-gateway -n nginx-gateway`
    }
  },
  {
    id: 'cka-gw-2', topic: 'cka-gateway', difficulty: 'hard',
    title: 'Convert HTTP Gateway to HTTPS on 443 with TLS for kodekloud.com',
    scenario: `An existing Gateway <code>web-gateway</code> in namespace <code>cka5673</code> currently listens on port 80 (HTTP). Modify it to listen on 443 with HTTPS for hostname <code>kodekloud.com</code>, using TLS cert from secret <code>kodekloud-tls</code>.`,
    hint: {
      url: 'https://gateway-api.sigs.k8s.io/guides/tls/',
      path: 'gateway-api.sigs.k8s.io → Guides → TLS',
      tip: 'Replace the listener entirely: protocol HTTPS, port 443, hostname, and tls.certificateRefs[].name pointing at the secret. tls.mode defaults to Terminate (which is what you want).'
    },
    answer: {
      explanation: `For HTTPS termination, the listener needs <code>protocol: HTTPS</code>, <code>port: 443</code>, <code>hostname</code>, and <code>tls.certificateRefs</code>. The secret must be a <code>kubernetes.io/tls</code> secret in the same namespace as the Gateway (or referenced cross-namespace via ReferenceGrant).`,
      yaml: `apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: web-gateway
  namespace: cka5673
spec:
  gatewayClassName: nginx
  listeners:
  - name: https
    protocol: HTTPS
    port: 443
    hostname: kodekloud.com
    tls:
      certificateRefs:
      - name: kodekloud-tls       # must be in same ns or use ReferenceGrant

# Apply
kubectl apply -f web-gateway.yaml

# Verify
kubectl get gateway -n cka5673 web-gateway -o yaml | grep -A6 listeners`
    }
  },

  // ── CKA: CLUSTER TROUBLESHOOTING ──────────────────────────────────────────
  {
    id: 'cka-ts-1', topic: 'cka-troubleshoot', difficulty: 'medium',
    title: 'Fix kubeconfig: server URL has wrong port',
    scenario: `<code>/root/CKA/admin.kubeconfig</code> exists but kubectl fails. The cluster's apiserver runs on the standard port. Inspect and fix the file.`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/',
      path: 'Concepts → Configuration → Organize Cluster Access using kubeconfig',
      tip: 'Test with: kubectl --kubeconfig=/root/CKA/admin.kubeconfig get nodes. Common issue: the server: URL has the wrong port (e.g. 1234 instead of 6443). Fix in clusters[].cluster.server.'
    },
    answer: {
      explanation: `kubeadm clusters always use port <strong>6443</strong> for the apiserver. If the kubeconfig shows anything else (1234, 8080, etc.), correct it.`,
      yaml: `# Test the failing kubeconfig
kubectl --kubeconfig=/root/CKA/admin.kubeconfig get nodes

# Inspect it
cat /root/CKA/admin.kubeconfig

# Fix the server URL
vi /root/CKA/admin.kubeconfig
# Change:
#   clusters:
#   - cluster:
#       certificate-authority-data: ...
#       server: https://controlplane:1234     <-- WRONG
# To:
#       server: https://controlplane:6443     <-- 6443 is the apiserver port

# Verify
kubectl --kubeconfig=/root/CKA/admin.kubeconfig get nodes`
    }
  },
  {
    id: 'cka-ts-2', topic: 'cka-troubleshoot', difficulty: 'hard',
    title: 'kubectl not working at all, iagnose the control plane',
    scenario: `On <code>cluster2-controlplane</code>, kubectl commands fail (connection refused / timeout). Bring kubectl back to a working state.`,
    hint: {
      url: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/',
      path: 'Tasks → Debug → Troubleshooting Clusters',
      tip: 'Walk the stack: (1) is kubelet running? systemctl status kubelet → journalctl -u kubelet -f. (2) is the apiserver static pod healthy? crictl ps + crictl logs. (3) check /etc/kubernetes/manifests/kube-apiserver.yaml for typos in --etcd-servers / --service-cluster-ip-range / cert paths. (4) /etc/kubernetes/admin.conf permissions and KUBECONFIG.'
    },
    answer: {
      explanation: `Most cluster2 troubleshooting tasks come down to: a typo in <code>/etc/kubernetes/manifests/kube-apiserver.yaml</code>, a stopped kubelet, or a bad <code>KUBECONFIG</code>. Walk the stack from kubelet → static pods → manifest.`,
      yaml: `# 1. Is the kubelet running?
systemctl status kubelet
# If not: systemctl start kubelet
journalctl -u kubelet -n 50 --no-pager

# 2. Are the static control plane pods running?
sudo crictl ps -a | grep -E 'apiserver|controller|scheduler|etcd'
# If apiserver is missing/crashing:
sudo crictl logs <container-id>

# 3. Inspect the apiserver manifest for typos
cat /etc/kubernetes/manifests/kube-apiserver.yaml | grep -E '(etcd|cert|key|client-ca|tls)'
# Common breakage: wrong --etcd-servers URL, wrong cert path,
# accidentally renamed file in /etc/kubernetes/pki/

# 4. KUBECONFIG sanity
echo $KUBECONFIG
ls -l /etc/kubernetes/admin.conf
# If empty:
export KUBECONFIG=/etc/kubernetes/admin.conf
# Or for kubeadm default:
mkdir -p $HOME/.kube
sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# 5. Final test
kubectl get nodes`
    }
  },
  {
    id: 'cka-ts-3', topic: 'cka-troubleshoot', difficulty: 'hard',
    title: 'Deployment pods stuck pending due to ResourceQuota, fix without changing limits or quota',
    scenario: `Deployment <code>backend-api</code> shows 2/3 ready. The third pod fails to schedule. There is a <code>ResourceQuota</code> <code>cpu-mem-quota</code> in the default namespace. <strong>You may NOT edit the deployment's resource limits or the ResourceQuota.</strong> Make all 3 pods Running.`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/policy/resource-quotas/',
      path: 'Concepts → Policies → Resource Quotas',
      tip: 'Trick wording,"limits" must not change, but the deployment\'s resource REQUESTS can be reduced (limits ≠ requests). kubectl describe rs to see the exact "exceeded quota" error. Lower spec.template.spec.containers[].resources.requests, then delete the old ReplicaSet to force the new pod template to take effect.'
    },
    answer: {
      explanation: `<span class="highlight">Wording trap:</span> "limits" in the prompt means the limits field, ou can still adjust <code>requests</code>. Reducing <code>requests.memory</code>/<code>cpu</code> fits the deployment under the quota, with limits untouched.`,
      yaml: `# 1. See the deployment status
kubectl get deploy backend-api
# Output: backend-api 2/3 ...

# 2. Find the failing ReplicaSet event
kubectl get rs
kubectl describe rs backend-api-7977bfdbd5
# Look for: "exceeded quota: cpu-mem-quota,
#            requested: requests.memory=128Mi, used: 256Mi, limited: 300Mi"

# 3. Edit the deployment, educe REQUESTS only (limits unchanged)
kubectl edit deployment backend-api
# spec.template.spec.containers[].resources:
#   requests:
#     cpu: "50m"           <-- was 100m
#     memory: "90Mi"       <-- was 128Mi (now 3 x 90 = 270Mi, fits in 300Mi)
#   limits:
#     cpu: "150m"          <-- UNCHANGED
#     memory: "150Mi"      <-- UNCHANGED

# 4. Old RS may still exist, delete it to clear stuck pods
kubectl get rs
kubectl delete rs backend-api-7977bfdbd5

# 5. Verify
kubectl get pods                    # 3/3 Running
kubectl describe deploy backend-api | grep Limits   # limits unchanged
kubectl describe quota cpu-mem-quota                # quota unchanged`
    }
  },
  {
    id: 'cka-ts-4', topic: 'cka-troubleshoot', difficulty: 'medium',
    title: 'PVC stuck Pending, fix size/selector mismatch without altering the PV',
    scenario: `A deployment <code>alpha-mysql</code> in namespace <code>alpha</code> has pods stuck in Pending. There's a PV <code>alpha-pv</code> already created. The pods should mount it at <code>/var/lib/mysql</code> with env <code>MYSQL_ALLOW_EMPTY_PASSWORD=1</code>. <strong>Do NOT alter the PV.</strong>`,
    hint: {
      url: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/#binding',
      path: 'Concepts → Storage → Persistent Volumes → Binding',
      tip: 'PVCs bind to PVs only when storage size, accessModes, and (if present) selector labels all match. kubectl describe pvc shows the binding error. Fix the PVC (or the deployment\'s PVC ref / volume mount), ever touch the PV.'
    },
    answer: {
      explanation: `Binding requires: PVC.requests.storage ≤ PV.capacity, accessModes overlap, and PVC.selector matches PV.labels (when set). Adjust the PVC, not the PV.`,
      yaml: `# 1. See what the PV exposes
kubectl get pv alpha-pv -o yaml
# Note: capacity, accessModes, labels (if any), storageClassName

# 2. See why the PVC isn't binding
kubectl describe pvc -n alpha
# "no PV available" usually means storage size or selector mismatch

# 3. Edit the PVC to match the PV
kubectl edit pvc <pvc-name> -n alpha
# Common fixes:
#   spec.resources.requests.storage: <= PV capacity (e.g. 500Mi instead of 1Gi)
#   spec.accessModes: overlap with PV (e.g. ReadWriteOnce)
#   spec.selector.matchLabels: match PV's labels exactly
#   spec.storageClassName: must match (often "" / manual / standard)

# 4. Make sure the deployment has the env + volume mount
kubectl edit deploy alpha-mysql -n alpha
# spec.template.spec.containers[].env:
# - name: MYSQL_ALLOW_EMPTY_PASSWORD
#   value: "1"
# spec.template.spec.containers[].volumeMounts:
# - name: data
#   mountPath: /var/lib/mysql

# 5. Verify
kubectl get pvc -n alpha            # Bound
kubectl get pods -n alpha           # Running`
    }
  },
];
