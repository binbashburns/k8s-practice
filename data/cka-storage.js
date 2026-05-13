// Questions for topic 'cka-storage'. Loaded by index.html before js/questions.js,
// which concatenates all Q_* arrays into the global QUESTIONS.

const Q_CKA_STORAGE = [
  {
    id: 'cka-storage-1',
    topic: 'cka-storage',
    difficulty: 'medium',
    title: 'StorageClass with local-path provisioner, WaitForFirstConsumer, expansion enabled',
    scenario: 'Create a StorageClass named <code>rancher-sc</code>: provisioner <code>rancher.io/local-path</code>, volumeBindingMode <code>WaitForFirstConsumer</code>, <code>allowVolumeExpansion: true</code>.',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/storage/storage-classes/',
      path: 'Concepts → Storage → Storage Classes',
      tip: 'No imperative create for StorageClass on the exam, write the YAML. volumeBindingMode and allowVolumeExpansion are top-level fields under the StorageClass kind, not under parameters.'
    },
    answer: {
      explanation: 'StorageClass fields live at the top level of the object (not under <code>spec</code>): <code>provisioner</code>, <code>volumeBindingMode</code>, <code>allowVolumeExpansion</code>, <code>parameters</code>, <code>reclaimPolicy</code>.',
      yaml: `apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rancher-sc
provisioner: rancher.io/local-path
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true

# Apply and verify
kubectl apply -f rancher-sc.yaml
kubectl get storageclass rancher-sc -o yaml`
    }
  },
  {
    id: 'cka-storage-2',
    topic: 'cka-storage',
    difficulty: 'medium',
    title: 'PVC stuck Pending: fix accessModes on the claim without touching the PV',
    scenario: 'PVC <code>app-pvc</code> in namespace <code>storage-ns</code> is not binding to PV <code>app-pv</code>. Identify the mismatch and fix it on the PVC. <strong>Do not modify the PV.</strong>',
    hint: {
      url: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/#binding',
      path: 'Concepts → Storage → Persistent Volumes → Binding',
      tip: 'kubectl describe pv app-pv and kubectl describe pvc app-pvc -n storage-ns. Compare accessModes, storage size, storageClassName, selector labels. PVCs are largely immutable, so to change accessModes you flush to a file, edit, delete, recreate.'
    },
    answer: {
      explanation: 'Binding requires accessModes overlap, requested storage <= PV capacity, storageClassName match, and selector labels (if set on the PVC) match the PV labels. accessModes is immutable on an existing PVC, recreate it.',
      yaml: `# 1. See what the PV exposes
kubectl describe pv app-pv

# 2. See why the PVC is Pending
kubectl describe pvc app-pvc -n storage-ns
# Look at Events for the binding reason

# 3. Flush the PVC to a file
kubectl get pvc app-pvc -n storage-ns -o yaml > pvc.yaml

# 4. Edit pvc.yaml, set accessModes to match the PV
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-pvc
  namespace: storage-ns
spec:
  accessModes:
    - ReadWriteOnce     # match PV.spec.accessModes
  resources:
    requests:
      storage: 1Gi      # <= PV capacity
  storageClassName: ""  # match PV.spec.storageClassName

# 5. Delete and recreate
kubectl delete pvc app-pvc -n storage-ns
kubectl apply -f pvc.yaml

# 6. Verify Bound
kubectl get pvc app-pvc -n storage-ns`
    }
  }
];
