class QueueController {
  constructor(state, dom, priorityLabels, priorityColor, callbacks) {
    this.state = state;
    this.dom = dom;
    this.priorityLabels = priorityLabels;
    this.priorityColor = priorityColor;
    this.callbacks = callbacks;
  }

  init() {
    this.dom.callNext.addEventListener("click", () => this.callNext());
    this.dom.completeCurrent.addEventListener("click", () => this.completeCurrent());
  }

  callNext() {
    if (this.state.triages.some((triage) => this.state.getTriageStatus(triage) === "in_service")) {
      return;
    }
    const called = this.state.triages.find((triage) => this.state.getTriageStatus(triage) === "waiting");
    if (!called) {
      return;
    }
    called.status = "in_service";
    const patient = this.state.patients.find((item) => item.id === called.patientId);
    window.alert(`${patient ? this.state.getPatientName(patient) : "Paciente"} chamado para atendimento.`);
    this.state.save();
    this.callbacks.renderAll();
  }

  completeCurrent() {
    const index = this.state.triages.findIndex((triage) =>
      this.state.getTriageStatus(triage) === "in_service"
    );
    if (index === -1) {
      return;
    }

    const [completed] = this.state.triages.splice(index, 1);
    const patient = this.state.patients.find((item) => item.id === completed.patientId);
    this.state.save();
    this.callbacks.renderAll();
    window.alert(`${patient ? this.state.getPatientName(patient) : "Paciente"}: atendimento concluído. Paciente liberado para nova triagem.`);
  }

  render() {
    if (this.state.triages.length === 0) {
      this.dom.queueBoard.innerHTML = `<div class="empty-state">Nenhum paciente aguardando atendimento.</div>`;
    } else {
      this.dom.queueBoard.innerHTML = this.state.triages.map((triage) => {
        const patient = this.state.patients.find((item) => item.id === triage.patientId);
        const patientName = patient ? this.state.getPatientName(patient) : "Paciente não encontrado";
        const status = this.state.getTriageStatus(triage);
        return `
          <article class="queue-card">
            <div class="risk-bar" style="background:${this.priorityColor[triage.classification]}"></div>
            <div class="queue-body">
              <header>
                <div>
                  <strong>${patientName}</strong>
                  <small>Entrada ${triage.time} · ${status === "in_service" ? "Em atendimento" : "Aguardando"}</small>
                </div>
                <span class="tag ${triage.classification}">${this.priorityLabels[triage.classification]}</span>
              </header>
              <div class="tag-row">
                <span class="tag">PA ${triage.bloodPressure}</span>
                <span class="tag">Temp ${triage.temperature} °C</span>
                <span class="tag">SpO2 ${triage.oxygen}%</span>
              </div>
              <p class="meta-line">${triage.symptoms}</p>
            </div>
          </article>
        `;
      }).join("");
    }

    const inService = this.state.triages.some((triage) =>
      this.state.getTriageStatus(triage) === "in_service"
    );
    const hasWaiting = this.state.triages.some((triage) =>
      this.state.getTriageStatus(triage) === "waiting"
    );
    this.dom.callNext.disabled = inService || !hasWaiting;
    this.dom.completeCurrent.disabled = !inService;
  }
}

window.QueueController = QueueController;
