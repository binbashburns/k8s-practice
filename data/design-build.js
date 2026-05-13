// Questions for topic 'design-build'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_DESIGN_BUILD = [
  {
    id: 'db-1',
    topic: 'design-build',
    difficulty: 'medium',
    title: 'Sidecar container: write date to shared volume every 5 seconds',
    scenario: 'Create pod <code>ckad-web-pod</code> in namespace <code>ckad-multi-containers</code> with an <code>emptyDir</code> volume <code>my-vol</code>. Main container <code>web-app</code> runs <code>nginx:1.16</code>, mounting <code>my-vol</code> at <code>/usr/share/nginx/html</code>. Sidecar <code>log-container</code> runs <code>alpine</code>, writes <code>$(date) Hi I am from Sidecar container</code> to <code>/var/log/index.html</code> every 5 seconds.',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/',
      path: 'Concepts → Workloads → Pods → Sidecar Containers',
      tip: 'In K8s 1.29+, sidecars are defined in spec.initContainers with restartPolicy: Always. This makes them start before main containers and restart independently. The key difference from a regular initContainer is the restartPolicy field.'
    },
    answer: {
      explanation: 'Sidecar pattern: <code>restartPolicy: Always</code> inside initContainers makes it a true sidecar (K8s 1.29+). Both containers share the emptyDir volume.',
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
    id: 'db-2',
    topic: 'design-build',
    difficulty: 'medium',
    title: 'Multi-container pod: two containers, env var in second container',
    scenario: 'Create pod <code>cuda-pod</code> in namespace <code>ckad-multi-containers</code>. Container 1: <code>alpha</code>, image <code>alpine</code>, env <code>release=stable</code>, must stay running. Container 2: <code>beta</code>, image <code>nginx:1.17</code>, containerPort 8080.',
    hint: {
      url: 'https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/',
      path: 'Tasks → Inject Data → Define an environment variable',
      tip: 'For alpine to stay running, it needs a sleep command. env vars use the spec.containers[].env list with name/value pairs. Both containers go under spec.containers, no special field needed.'
    },
    answer: {
      explanation: 'Alpine has no long-running process by default, add <code>command: ["/bin/sh", "-c", "sleep 3600"]</code> or it exits immediately.',
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
    id: 'db-3',
    topic: 'design-build',
    difficulty: 'medium',
    title: 'ConfigMap + pod: env var from ConfigMap, emptyDir volume for logs',
    scenario: 'Create a ConfigMap <code>time-config</code> in namespace <code>dvl1987</code> with key <code>TIME_FREQ=10</code>. Create pod <code>time-check</code> using image <code>busybox</code>. The container should run: <code>while true; do date; sleep $TIME_FREQ; done &gt; /opt/time/time-check.log</code>. Mount an emptyDir at <code>/opt/time</code>. Get TIME_FREQ from the ConfigMap.',
    hint: {
      url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/#define-container-environment-variables-using-configmap-data',
      path: 'Tasks → Configure Pods → ConfigMaps → Define env vars from ConfigMap',
      tip: 'Use env.valueFrom.configMapKeyRef to pull a single key from a ConfigMap. The command list format is important: use ["/bin/sh", "-c", "command string"] for shell commands. emptyDir goes in volumes, not referenced by storageClassName.'
    },
    answer: {
      explanation: 'The command redirects to a file, it must be in shell form (<code>/bin/sh -c</code>). The env is sourced from the ConfigMap via <code>configMapKeyRef</code>.',
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
    id: 'db-4',
    topic: 'design-build',
    difficulty: 'hard',
    title: 'CRD: create a CustomResourceDefinition with schema validation',
    scenario: 'Create a CRD for resource kind <code>Foo</code> (plural <code>foos</code>) in group <code>samplecontroller.example.com</code>, version <code>v1alpha1</code>. Schema: <code>deploymentName</code> (string) and <code>replicas</code> (integer, min 1, max 5). Include a <code>status</code> subresource. Namespace scoped.',
    hint: {
      url: 'https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/',
      path: 'Tasks → Extend Kubernetes → CRDs',
      tip: 'Find the "Validation" section. The schema goes under spec.versions[].schema.openAPIV3Schema. Status subresource is enabled by spec.versions[].subresources.status: {}. The CRD name must be plural.group format: foos.samplecontroller.example.com'
    },
    answer: {
      explanation: 'CRD name = <code>plural.group</code>. Schema validation goes in openAPIV3Schema. status subresource unlocks <code>kubectl get foo/status</code>.',
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
    id: 'db-5',
    topic: 'design-build',
    difficulty: 'medium',
    title: 'Security context: privileged pod + add SYS_TIME capability',
    scenario: 'Update pod <code>app-sec-kff3345</code> to run as root (<code>runAsNonRoot: false</code>) and add capability <code>SYS_TIME</code>. The pod runs image <code>ubuntu</code> with <code>sleep 4800</code>.',
    hint: {
      url: 'https://kubernetes.io/docs/tasks/configure-pod-container/security-context/#set-capabilities-for-a-container',
      path: 'Tasks → Configure Pods → Security Context → Set capabilities',
      tip: 'securityContext goes under spec.containers[]. capabilities.add takes a list of strings. When recreating the pod, do NOT copy the auto-generated volumeMounts for service account tokens, those will fail.'
    },
    answer: {
      explanation: `Strip auto-generated fields when recreating pods. <code>kubectl get pod -o yaml</code> includes a kube-api-access volumeMount that won't exist in the new pod spec and will fail apply.`,
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
  {
    id: 'me6-1',
    topic: 'design-build',
    difficulty: 'fail',
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
      explanation: 'Init containers run to completion before main containers start. They live under <code>spec.initContainers</code>. Chain the echo and sleep with <code>&amp;&amp;</code> inside <code>sh -c</code>.',
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
    id: 'me6-4',
    topic: 'design-build',
    difficulty: 'fail',
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
      explanation: "Schema validation nests under <code>spec.versions[].schema.openAPIV3Schema.properties.spec.properties</code>. Each integer field gets <code>minimum</code> and <code>maximum</code>. Don't forget <code>scope: Namespaced</code> under <code>spec</code>.",
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
    id: 'db-cm-1',
    topic: 'design-build',
    difficulty: 'medium',
    title: 'ConfigMap (ENV + LOG_LEVEL) wired into an existing Deployment',
    scenario: 'Create ConfigMap <code>app-config</code> in namespace <code>cm-namespace</code> with <code>ENV=production</code> and <code>LOG_LEVEL=info</code>. Modify the existing Deployment <code>cm-webapp</code> in the same namespace so its container reads both env vars from this ConfigMap.',
    hint: {
      url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/',
      path: 'Tasks → Configure Pods and Containers → Configure a Pod to Use a ConfigMap',
      tip: 'kubectl create configmap app-config --from-literal=KEY=VALUE (repeat per key). For the deployment, kubectl set env deploy/<name> --from=configmap/app-config injects every key as an env var (uses envFrom under the hood).'
    },
    answer: {
      explanation: 'Imperative end-to-end: <code>kubectl create configmap --from-literal</code> for the data, then <code>kubectl set env ... --from=configmap/</code> to wire it into the deployment via <code>envFrom</code>. Pods restart automatically.',
      yaml: `# 1. ConfigMap
kubectl create configmap app-config -n cm-namespace \\
  --from-literal=ENV=production \\
  --from-literal=LOG_LEVEL=info

# 2. Wire it into the deployment (envFrom)
kubectl set env deployment/cm-webapp -n cm-namespace \\
  --from=configmap/app-config

# 3. Verify
kubectl get cm app-config -n cm-namespace -o yaml
kubectl set env deploy/cm-webapp -n cm-namespace --list
kubectl exec -n cm-namespace deploy/cm-webapp -- env | grep -E '^(ENV|LOG_LEVEL)='`
    }
  }
];
