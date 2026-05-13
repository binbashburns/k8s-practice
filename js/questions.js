// Concatenates per-topic data files into the global QUESTIONS array.
// Edit individual question lists in data/<topic>.js, which declare Q_<TOPIC> consts
// loaded by index.html before this file.

const QUESTIONS = [
  ...Q_NETWORK_POLICY,
  ...Q_INGRESS,
  ...Q_CRONJOB,
  ...Q_OBSERVABILITY,
  ...Q_DESIGN_BUILD,
  ...Q_SERVICES,
  ...Q_DEPLOYMENT,
  ...Q_CKA_ETCD,
  ...Q_CKA_CRICTL,
  ...Q_CKA_JSONPATH,
  ...Q_CKA_UPGRADE,
  ...Q_CKA_STATIC_POD,
  ...Q_CKA_CSR_RBAC,
  ...Q_CKA_DNS,
  ...Q_CKA_CNI,
  ...Q_CKA_GATEWAY,
  ...Q_CKA_HELM,
  ...Q_CKA_STORAGE,
  ...Q_CKA_SCHEDULING,
  ...Q_CKA_TROUBLESHOOT,
];
