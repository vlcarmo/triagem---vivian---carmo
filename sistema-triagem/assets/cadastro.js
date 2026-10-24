class PatientRegistration {
  constructor(state, dom, callbacks) {
    this.state = state;
    this.dom = dom;
    this.callbacks = callbacks;
  }

  init() {
    this.dom.patientForm.addEventListener("submit", (event) => this.handleSubmit(event));
    this.dom.clearPatientForm.addEventListener("click", () => this.reset());
    this.dom.patientSearch.addEventListener("input", () => this.render());
    this.dom.patientList.addEventListener("click", (event) => this.handleListClick(event));
  }

  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(this.dom.patientForm);
    const characterLimits = {
      firstName: { label: "Nome", max: 50 },
      lastName: { label: "Sobrenome", max: 50 },
      age: { label: "Idade", max: 3 },
      address: { label: "Endereço", max: 120 },
      insuranceName: { label: "Convênio", max: 60 },
      insuranceCard: { label: "Número da carteirinha", max: 30 }
    };
    const exceededField = Object.entries(characterLimits).find(([field, limit]) =>
      String(data.get(field) || "").length > limit.max
    );
    if (exceededField) {
      const [, limit] = exceededField;
      this.callbacks.showMessage(
        this.dom.patientMessage,
        `O campo ${limit.label} deve ter no máximo ${limit.max} caracteres.`
      );
      return;
    }

    const insuranceValidUntil = data.get("insuranceValidUntil");
    const validityStatus = this.state.getInsuranceValidityStatus(insuranceValidUntil);
    if (validityStatus === "expired") {
      this.callbacks.showMessage(this.dom.patientMessage, "Carteirinha vencida. Atualize a validade para cadastrar o paciente.");
      return;
    }
    if (validityStatus === "invalid") {
      this.callbacks.showMessage(this.dom.patientMessage, "A validade da carteirinha é inválida.");
      return;
    }

    const patient = {
      id: crypto.randomUUID(),
      firstName: data.get("firstName").trim(),
      lastName: data.get("lastName").trim(),
      age: data.get("age").trim(),
      gender: data.get("gender"),
      address: data.get("address").trim(),
      insuranceName: data.get("insuranceName").trim(),
      insuranceCard: data.get("insuranceCard").trim(),
      insuranceValidUntil,
      insurancePlan: data.get("insurancePlan"),
      createdAt: new Date().toISOString()
    };
    if (!patient.firstName || !patient.lastName || !patient.age || !patient.gender || !patient.address || !patient.insuranceName || !patient.insuranceCard) {
      this.callbacks.showMessage(this.dom.patientMessage, "Preencha os campos obrigatórios.");
      return;
    }
    this.state.patients.push(patient);
    this.state.selectedPatientId = patient.id;
    this.state.save();
    this.reset();
    this.callbacks.showMessage(this.dom.patientMessage, "Paciente cadastrado.");
    this.callbacks.renderAll();
  }

  handleListClick(event) {
    const selectButton = event.target.closest("[data-select-patient]");
    const deleteButton = event.target.closest("[data-delete-patient]");
    if (selectButton) {
      this.state.selectedPatientId = selectButton.dataset.selectPatient;
      this.callbacks.setScreen("triagem");
      this.callbacks.renderAll();
    }
    if (deleteButton) {
      const index = Number(deleteButton.dataset.deletePatient);
      const removed = this.state.patients.splice(index, 1)[0];
      if (removed) {
        this.state.triages = this.state.triages.filter((triage) => triage.patientId !== removed.id);
      }
      this.state.save();
      this.callbacks.renderAll();
    }
  }

  reset() {
    this.dom.patientForm.reset();
  }

  render() {
    const search = this.dom.patientSearch.value.trim().toLowerCase();
    const searchTerms = search.split(/\s+/).filter(Boolean);

    const patients = this.state.patients.filter((patient) => {
      const fullName = this.state.getPatientName(patient).toLowerCase();
      const firstName = patient.firstName.toLowerCase();
      const lastName = patient.lastName.toLowerCase();

      return searchTerms.length === 0 || searchTerms.every((term) =>
        fullName.includes(term) || firstName.includes(term) || lastName.includes(term)
      );
    });

    if (patients.length === 0) {
      this.dom.patientList.innerHTML = `<div class="empty-state">Nenhum paciente na recepção.</div>`;
      return;
    }
    this.dom.patientList.innerHTML = patients.map((patient, index) => `
      <article class="patient-card">
        <header>
          <div>
            <strong>${this.state.getPatientName(patient)}</strong>
            <small>${patient.age} anos · ${patient.gender}</small>
          </div>
          <span class="tag">${patient.insurancePlan}</span>
        </header>
        <div class="meta-line">${patient.address}</div>
        <div class="meta-line">${patient.insuranceName} · ${patient.insuranceCard}</div>
        <div class="patient-actions">
          <button class="small-button" data-select-patient="${patient.id}" type="button" ${this.state.hasActiveTriage(patient.id) ? "disabled" : ""}>Triar</button>
          <button class="small-button danger-button" data-delete-patient="${index}" type="button">Remover</button>
        </div>
      </article>
    `).join("");
  }
}

window.PatientRegistration = PatientRegistration;
