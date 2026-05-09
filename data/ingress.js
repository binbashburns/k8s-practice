// Questions for topic 'ingress'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_INGRESS = [
  {
    id: 'ing-1',
    topic: 'ingress',
    difficulty: 'fail',
    title: 'Multi-host Ingress: route two hostnames to two services',
    scenario: 'Create an Ingress named <code>ingress-vh-routing</code>. Route:<br>• <code>watch.ecom-store.com/video</code> → <code>video-service</code><br>• <code>apparels.ecom-store.com/wear</code> → <code>apparels-service</code><br><br>Add annotation <code>nginx.ingress.kubernetes.io/rewrite-target: /</code>. The IngressController is exposed on NodePort 30093 externally. The services run on port 8080 internally.',
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
    id: 'ing-2',
    topic: 'ingress',
    difficulty: 'medium',
    title: 'Single-path Ingress with ingressClassName and ssl-redirect annotation',
    scenario: 'Applications run in the <code>global-space</code> namespace. Create Ingress <code>ingress-resource-xnz</code> exposing <code>/eat</code> → <code>food-service:8080</code>. Use ingress class <code>nginx</code>. Add annotations: <code>rewrite-target: /</code> and <code>ssl-redirect: "false"</code>.',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/ingress/#ingress-class',
      path: 'Concepts → Ingress → IngressClass',
      tip: 'The ingressClassName field goes under spec, not annotations. The imperative command "kubectl create ingress" supports --class and --annotation flags directly.'
    },
    answer: {
      explanation: 'Use <code>spec.ingressClassName: nginx</code> for the class. The two annotations go in metadata.annotations. Imperative command shown too.',
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
    id: 'ing-3',
    topic: 'ingress',
    difficulty: 'hard',
    title: 'Troubleshoot: IngressController crashing with "default-backend-service not found"',
    scenario: 'The IngressController pod in <code>ingress-nginx</code> namespace keeps crashing. Logs show: <code>No service with name default-backend-service found in namespace default</code>. The actual backend service <code>default-backend-service</code> lives in the <code>green-space</code> namespace. Fix this without recreating the Ingress resource.',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/',
      path: 'Concepts → Ingress Controllers',
      tip: 'The IngressController deployment has a --default-backend-service arg. Get the deployment YAML, edit the arg to use green-space/default-backend-service, delete the old deployment, and apply the fixed one.'
    },
    answer: {
      explanation: 'The IngressController deployment has a CLI arg specifying the backend namespace. Save → Delete → Edit → Re-apply.',
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
  }
];
