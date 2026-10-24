# Documentação de bugs

## Bug 1 — Cadastro sem limite de caracteres

| Campo | Detalhes |
|---|---|
| Descrição | Os campos textuais do cadastro de paciente não tinham limites de caracteres nem validação de tamanho antes de salvar. |
| Comportamento Obtido: | Era possível enviar conteúdo maior que o adequado nos campos do cadastro. |
| Comportamento Esperado: | Limitar e validar os dados antes de salvá-los, informando o limite excedido. |
| Área afetada: | Cadastro de paciente. Arquivos: `index.html` e `assets/cadastro.js`. Causa: ausência de `maxlength` nos campos e de validação de comprimento no envio do formulário. |
| Solução do problema: | Aplicados limites para nome (50), sobrenome (50), idade (3), endereço (120), convênio (60) e número da carteirinha (30) caracteres. O formulário valida os comprimentos antes de salvar e informa o campo e o limite excedido. |

## Bug 2 — Continuidade com carteirinha vencida

| Campo | Detalhes |
|---|---|
| Descrição | A validade da carteirinha não era verificada antes do cadastro ou da triagem. |
| Comportamento Obtido: | A continuidade do fluxo era permitida mesmo quando a validade informada era anterior ao mês atual. |
| Comportamento Esperado: | Bloquear o cadastro ou a triagem quando a validade estiver vencida e apresentar uma mensagem explicativa. |
| Área afetada: | Cadastro e triagem. Arquivos: `assets/state.js`, `assets/cadastro.js` e `assets/triagem.js`. Causa: o campo de validade era armazenado, mas não havia comparação com a data atual em nenhuma das etapas. |
| Solução do problema: | Adicionada validação compartilhada da validade no estado e bloqueio tanto no cadastro quanto antes de registrar a triagem. Como o campo é do tipo mês, o mês corrente permanece válido; meses anteriores são considerados vencidos. Datas malformadas também bloqueiam o fluxo com mensagem própria. |

## Bug 3 — Paciente disponível para nova triagem enquanto ativo

| Campo | Detalhes |
|---|---|
| Descrição | Um paciente com triagem ainda ativa podia ser selecionado novamente para uma nova triagem. |
| Comportamento Obtido: | O paciente permanecia disponível na seleção e o sistema aceitava outra triagem antes de concluir o atendimento anterior. |
| Comportamento Esperado: | Impedir nova triagem enquanto o paciente estiver aguardando ou em atendimento e liberá-lo após a conclusão. |
| Área afetada: | Triagem, fila e indicadores. Arquivos: `assets/state.js`, `assets/triagem.js`, `assets/fila.js`, `assets/app.js` e `index.html`. Causa: as triagens não tinham estado de atendimento e a ação “Chamar próximo” removia imediatamente a triagem da fila. |
| Solução do problema: | Novas triagens recebem estado `waiting`; o paciente é excluído das opções disponíveis enquanto houver triagem ativa. “Chamar próximo” altera o estado para `in_service`, mantendo o bloqueio, e “Concluir atendimento” remove o registro ativo e libera o paciente. Triagens antigas sem estado são interpretadas como aguardando, preservando os dados já salvos. |

## Resumo da entrega

- Código com os ajustes realizados para os três bugs descritos neste documento.
- Documentação com a descrição dos problemas, comportamentos observado e esperado, áreas afetadas e soluções aplicadas.
- Detalhamento da versão corrigida: **v11.1.0.2**.

## Detalhamento da versão corrigida

**Versão:** v11.1.0.2  
**Versão anterior exibida no sistema:** v11.1.0.1  
**Tipo da atualização:** correção incremental.

Esta versão inclui:

- Limites de caracteres e validação no cadastro de pacientes.
- Bloqueio de cadastro e triagem quando a carteirinha estiver vencida ou tiver validade inválida.
- Bloqueio de nova triagem enquanto houver atendimento aguardando ou em andamento, com liberação do paciente após concluir o atendimento.

Arquivos de código relacionados: `index.html`, `assets/cadastro.js`, `assets/state.js`, `assets/triagem.js`, `assets/fila.js`, `assets/app.js` e `assets/styles.css`.
