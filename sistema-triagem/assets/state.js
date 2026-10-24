class AppState {
  constructor(patientStorageKey, triageStorageKey) {
    this.patientStorageKey = patientStorageKey;
    this.triageStorageKey = triageStorageKey;
    this.patients = JSON.parse(localStorage.getItem(patientStorageKey) || "[]");
    this.triages = JSON.parse(localStorage.getItem(triageStorageKey) || "[]");
    this.activeScreen = "cadastro";
    this.selectedPatientId = "";
  }

  save() {
    localStorage.setItem(this.patientStorageKey, JSON.stringify(this.patients));
    localStorage.setItem(this.triageStorageKey, JSON.stringify(this.triages));
  }

  getPatientName(patient) {
    return `${patient.firstName} ${patient.lastName}`;
  }

  getSelectedPatient() {
    return this.patients.find((patient) => patient.id === this.selectedPatientId);
  }

  getTriageStatus(triage) {
    return triage.status || "waiting";
  }

  hasActiveTriage(patientId) {
    return this.triages.some((triage) =>
      triage.patientId === patientId && this.getTriageStatus(triage) !== "completed"
    );
  }

  getInsuranceValidityStatus(insuranceValidUntil) {
    if (!insuranceValidUntil) {
      return "missing";
    }

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(insuranceValidUntil)) {
      return "invalid";
    }

    const [year, month] = insuranceValidUntil.split("-").map(Number);
    const today = new Date();
    const currentMonth = today.getFullYear() * 12 + today.getMonth();
    const expiryMonth = year * 12 + month - 1;

    return expiryMonth < currentMonth ? "expired" : "valid";
  }
}

window.AppState = AppState;
