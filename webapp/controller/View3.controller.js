sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/Token',
    "sap/ui/model/json/JSONModel",
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Token, JSONModel, jQuery, MessageBox, Filter, FilterOperator, ValueHelpDialog, Export, ExportTypeCSV) {
        "use strict";
        var serviceUrl = "/sap/opu/odata/sap/ZPP_KANBAN_CARD_SRV/",
            vm = null;
        return Controller.extend("zz1cartoes.controller.View3", {
            onInit: function () {
                var oView = this.getView();
                var vm = this;
                var oModel = new sap.ui.model.odata.ODataModel(serviceUrl);
                var oView = this.getView();
                oView.setModel(oModel);
                oView.addEventDelegate({
                    onBeforeShow: function () {
                        if (vm.getOwnerComponent().getModel("detailDataView2") == undefined) {
                            vm.getRouter().navTo("View1");
                        } else {

                            var oContainer = vm.getOwnerComponent().getModel("detailDataView2").getProperty("/");

                            vm.byId("tMatnr").setText(oContainer.Matnr + "-" + oContainer.Maktx);
                            vm.byId("tAUFNR").setText(oContainer.Aufnr);
                            vm.byId("tReserva").setText(oContainer.Rsnum);
                            vm.byId("tItemReserva").setText(oContainer.Rspos);
                            vm.byId("tTpFran").setText(oContainer.ValueChar);

                            vm.byId("tLgt").setText(oContainer.Werks);
                            vm.byId("tQtdNesc").setText(oContainer.Dbmng);
                            vm.byId("tQtdEnviada").setText(oContainer.QuantidadeOP);
                            vm.byId("tEstoque").setText(oContainer.EstoqueFabrica);
                            vm.byId("tQtdPorCartao").setText(oContainer.Multiplo);
                            vm.byId("tQtdNConfirmada").setText(oContainer.QtdNConfirmada);
                            vm.byId("Save").setVisible(true);
                            vm.byId("_IDGenButton2").setVisible(true);
                            vm.byId("_IDGenButton3").setVisible(true);

                            var filters = [];
                            filters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, oContainer.Werks));

                            filters.push(new sap.ui.model.Filter("Aufnr", sap.ui.model.FilterOperator.EQ, oContainer.Aufnr.padStart(12, "0")));

                            filters.push(new sap.ui.model.Filter("Rsnum", sap.ui.model.FilterOperator.EQ, oContainer.Rsnum));

                            filters.push(new sap.ui.model.Filter("Rspos", sap.ui.model.FilterOperator.EQ, oContainer.Rspos));
                            var oModel = new sap.ui.model.odata.ODataModel(serviceUrl);
                            oModel.read(
                                "/KanbanCardSet", {
                                filters: filters,
                                success: function (oData) {
                                    var tbData = oView.byId("idTableItens");
                                    var newArray = [];
                                    for (var i = 0; i < oData.results.length; i++) {
                                        if (oData.results[i].UtilizarEstoque == "X") {
                                            oData.results[i].QtdCartoes = "Estoque de fábrica"
                                        }
                                        if(oData.results[i].Aufnr == "hideBtns"){
                                            vm.byId("Save").setVisible(false);
                                            vm.byId("_IDGenButton2").setVisible(false);
                                            vm.byId("_IDGenButton3").setVisible(false);                                         
                                        }else{
                                            newArray.push(oData.results[i])
                                        }
                                    }
                                    tbData.setModel(new JSONModel({
                                        "KanbanCardSet": newArray
                                    }));
                                },
                                error: function (oError) {
                                    vm.byId("Save").setVisible(false);
                                    vm.byId("_IDGenButton2").setVisible(false);
                                    vm.byId("_IDGenButton3").setVisible(false);
                                    var tbData = oView.byId("idTableItens");
                                    var newArray = [];
                                    tbData.setModel(new JSONModel({
                                        "KanbanCardSet": newArray
                                    }));
                                    var errorObj1 = jQuery.parseXML(oError.response.body).querySelector("message");

                                    /*   sap.m.MessageBox.show(
                                           errorObj1.textContent, {
                                           icon: MessageBox.Icon.ERROR,
                                           title: "Ocorreu um erro",
                                           actions: [MessageBox.Action.OK],
                                           onClose: function (oAction) { vm.getRouter().navTo("View1"); }
                                       }
                                       );*/
                                }
                            }
                            );
                            //vm.byId("idTableItens").getBinding("items").filter(filters);
                        }
                    }.bind(this)
                });
                this._oTPC = null;
                /* var oPersonalizationService = sap.ushell.Container.getService("Personalization");
                 var oPersonalizer = oPersonalizationService.getPersonalizer({
                     container: "zz1cartoes", // This key must be globally unique (use a key to
                     // identify the app) Note that only 40 characters are allowed
                     item: "itemidTable" // Maximum of 40 characters applies to this key as well
                 });
                 this._oTPC = new TablePersoController({
                     table: this.byId("idTable"),
                     //specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
                     componentName: "table",
                     persoService: oPersonalizer
                 }).activate();*/
            },
            onPersoButtonPressed: function (oEvent) {
                this._oTPC.openDialog();
                this._oTPC.attachPersonalizationsDone(this, this.onPerscoDonePressed.bind(this));
            },
            onPerscoDonePressed: function (oEvent) {
                this._oTPC.savePersonalizations();
            },
            _onPageNavButtonPress: function () {
                this.getRouter().navTo("View2");
                /*var sPath = {
                    "KanbanCardSet": []
                }
                var sData = [];
                var oJsonModel = new sap.ui.model.json.JSONModel(sPath);
                this.getView().byId("idTableItens").setModel(oJsonModel);
                this.getView().byId("idTableItens").getModel().refresh();*/
            },
            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this);
            },
            accessFragment: function (oEvent) {

                if (!this.DialogInsert) {
                    this.DialogInsert = this.DialogInsert = sap.ui.xmlfragment(
                        "aDialogInsert",
                        "zz1cartoes.view.DialogInsertCartao",
                        this
                    );

                    //to get access to the global model
                    this.getView().addDependent(this.DialogInsert);
                }
                sap.ui.core.Fragment.byId("aDialogInsert", "iQtdDeCartao").setValueState("None");
                sap.ui.core.Fragment.byId("aDialogInsert", "iQtdPorCartao").setValueState("None");
                sap.ui.core.Fragment.byId("aDialogInsert", "iCartaoUnico").setSelectedKey("false");
                sap.ui.core.Fragment.byId("aDialogInsert", "iQtdDeCartao").setValue("");
                sap.ui.core.Fragment.byId("aDialogInsert", "iQtdPorCartao").setValue("");
                sap.ui.core.Fragment.byId("aDialogInsert", "iUtilizarLivre").setSelectedKey("false");
                sap.ui.core.Fragment.byId("aDialogInsert", "_IDGenLabel1").setVisible(true);
                sap.ui.core.Fragment.byId("aDialogInsert", "iCartaoUnico").setVisible(true);
                sap.ui.core.Fragment.byId("aDialogInsert", "iQtdDeCartao").setVisible(true);
                sap.ui.core.Fragment.byId("aDialogInsert", "_IDGenLabel4").setVisible(true);
                this.DialogInsert.open();

            },
            DialogInsert_Cancel: function () {

                this.DialogInsert.close();

            },
            onValidaCampos: function () {
                var retorno = 0;
                if (sap.ui.core.Fragment.byId("aDialogInsert", "iUtilizarLivre").getSelectedKey() == "true") {
                    sap.ui.core.Fragment.byId("aDialogInsert", "iQtdDeCartao").setValue("Estoque de fábrica")
                }
                if (sap.ui.core.Fragment.byId("aDialogInsert", "iQtdDeCartao").getValue() === "") {
                    sap.ui.core.Fragment.byId("aDialogInsert", "iQtdDeCartao").setValueState("Error");
                    retorno = 1;
                }
                if (sap.ui.core.Fragment.byId("aDialogInsert", "iQtdPorCartao").getValue() === "") {
                    sap.ui.core.Fragment.byId("aDialogInsert", "iQtdPorCartao").setValueState("Error");
                    retorno = 1;
                }
                return retorno;
            },
            UpdateTableItens: function () {
                var iCartaoUnico = "";
                var iUtilizarLivre = "";
                var campos = this.getView().getController().onValidaCampos();
                if (campos === 0) {
                    if (sap.ui.core.Fragment.byId("aDialogInsert", "iCartaoUnico").getSelectedKey() === 'true') {
                        iCartaoUnico = "X";
                    }
                    var iQtdDeCartao = sap.ui.core.Fragment.byId("aDialogInsert", "iQtdDeCartao").getValue();
                    var iQtdPorCartao = sap.ui.core.Fragment.byId("aDialogInsert", "iQtdPorCartao").getValue();
                    if (sap.ui.core.Fragment.byId("aDialogInsert", "iUtilizarLivre").getSelectedKey() === 'true') {
                        iUtilizarLivre = "X";
                    }
                    if (this.getView().byId("idTableItens").getModel().getData() === null) { //oModel === undefined) {
                        var sPath = {
                            "KanbanCardSet": [{
                                "Item": "001",
                                "Unico": iCartaoUnico,
                                "QtdCartoes": iQtdDeCartao,
                                "QtdPCartao": iQtdPorCartao,
                                "UtilizarEstoque": iUtilizarLivre,
                                "Um": "KG",
                                "Status": "",
                            }]
                        };
                        var oJsonModel = new sap.ui.model.json.JSONModel(sPath);
                        this.getView().byId("idTableItens").setModel(oJsonModel);
                        this.getView().byId("idTableItens").getModel().refresh();
                        this.DialogInsert.close();
                    } else {
                        var oData = this.getView().byId("idTableItens").getModel().getData();
                        var index = oData.KanbanCardSet.length;
                        /* if (sap.ui.core.Fragment.byId("aParticipantes", "Dele").getVisible() === true) {
                             oData.Results.map(obj => {
                                 if (obj.Pernr === BP) {
                                     obj.Pernr = BP
                                     obj.Ename = NOME
                                     obj.DTACAN = DTACAN
                                     obj.Desligado = DESLIGADO
                                     obj.Obs = OBSERVACAO
                                 }
     
                             })
                             this.getView().byId("tParticipantes").getModel().refresh();
                             this.DialogParticipantes.close();
                         } else {
                             var rowItems = this.getView().byId("tParticipantes").getItems();
                             for (var i = 0; i < rowItems.length; i++) {
                                 var item = rowItems[i];
     
                                 var Cells = item.getCells();
                                 var BPCell = Cells[0].getText();
                                 if (BPCell === BP) { //&& DtaRow === Dta) {
                                     sap.m.MessageBox.show(
                                         "Já existe candidato com esse BP",
                                         sap.m.MessageBox.Icon.ERROR,
                                         "Erro ao incluir registro"
                                     )
                                     return;
                                 }
                             }*/
                        index = index + 1;
                        oData.KanbanCardSet.push({
                            "Item": index.toString().padStart(3, "0"),
                            "Unico": iCartaoUnico,
                            "QtdCartoes": iQtdDeCartao,
                            "QtdPCartao": iQtdPorCartao,
                            "UtilizarEstoque": iUtilizarLivre,
                            "Um": "KG",
                            "Status": "",
                        });
                        this.getView().byId("idTableItens").getModel().refresh();
                        this.DialogInsert.close();
                        //  }
                        //	}
                    }
                } else {
                    sap.m.MessageBox.show(
                        "É necessário preencher todos os campos obrigatórios",
                        sap.m.MessageBox.Icon.ERROR,
                        "Erro ao incluir registro"
                    );
                }
            },
            onDeleteTableItem: function () {
                var rowItems = this.getView().byId("idTableItens").getSelectedItems();
                var oData = this.getView().byId("idTableItens").getModel().getData();
                var oModel = this.getView().getModel();
                var oGlobalBusyDialog = new sap.m.BusyDialog();
                if (rowItems.length > 0) {
                    for (var i = 0; i < rowItems.length; i++) {
                        var item = rowItems[i];

                        oData.KanbanCardSet.map((obj, id) => {
                            if (obj.Item === item.getCells()[0].getText()) {
                                oData.KanbanCardSet.splice(id, 1)
                                if (obj.__metadata) {
                                    oGlobalBusyDialog.open();
                                    oModel.remove(obj.__metadata.self.split('ZPP_KANBAN_CARD_SRV/')[1], {
                                        method: "DELETE",
                                        success: function (oData) {
                                            oGlobalBusyDialog.close(); //FECHA O LOAD
                                        },
                                        error: function (err) { //DA UM GET NO ERRO
                                            oGlobalBusyDialog.close(); //FECHA O LOAD
                                            var errorObj1 = jQuery.parseXML(err.response.body).querySelector("message");
                                            sap.m.MessageBox.show(
                                                errorObj1.textContent,
                                                sap.m.MessageBox.Icon.ERROR,
                                                "Erro ao deletar o registro"
                                            );
                                        }
                                    });
                                }
                            }
                        })
                    }
                } else {
                    sap.m.MessageBox.show(
                        "Selecione ao menos uma linha",
                        sap.m.MessageBox.Icon.ERROR,
                        "Ocorreu um erro"
                    );
                }

                this.getView().byId("idTableItens").getModel().refresh();
                this.getView().byId("idTableItens").removeSelections();
            },
            onSave: function (oEvent) {
                var rowAllItems = this.getView().byId("idTableItens").getItems();
                var that = this;
                var batchChanges = [];
                var oModel = this.getView().getModel();
                var aEntry = [];
                var oContainer = this.getOwnerComponent().getModel("detailDataView2").getProperty("/");
                var Unico = "";
                var qtd = "";
                var UtilizarEstoque = "";
                if (oContainer.ValueChar == "NÃO GERAR KANBAN") {
                    sap.m.MessageBox.show(
                        "Não é possível gerar cartões KANBAN para este material.",
                        sap.m.MessageBox.Icon.ERROR,
                        "Erro ao enviar os dados"
                    );
                    return;
                }
                for (var i = 0; i < rowAllItems.length; i++) {
                    var item = rowAllItems[i];
                    var cells = item.getCells();
                    if (cells[0].getText() != "") {
                        if (cells[1].getSelected() == true) {
                            Unico = "X"
                        } else {
                            Unico = ""
                        }
                        if (cells[5].getSelected() == true) {
                            UtilizarEstoque = "X"
                        } else {
                            UtilizarEstoque = ""
                        }

                        if (cells[2].getText() == "Estoque de fábrica") {
                            qtd = "0"
                        } else {
                            qtd = cells[2].getText();
                        }
                        var oEntry = {
                            Aufnr: oContainer.Aufnr.padStart(12, "0"),
                            Werks: oContainer.Werks,
                            Rsnum: oContainer.Rsnum.padStart(10, "0"),
                            Rspos: oContainer.Rspos,
                            Lgfsb: oContainer.Lgfsb,
                            Item: cells[0].getText(),
                            Unico: Unico,
                            QtdCartoes: qtd,
                            QtdPCartao: cells[3].getText(),
                            UtilizarEstoque: UtilizarEstoque,
                            Um: cells[4].getText()
                        };
                        aEntry.push(oEntry)
                        batchChanges.push(oModel.createBatchOperation("/DeepKanbanCardSet", "POST", oEntry));
                    }
                }
                //batchChanges.push(oModel.createBatchOperation("/DeepKanbanCardSet", "POST", aEntry));
                if (batchChanges.length !== 0) {
                    oModel.addBatchChangeOperations(batchChanges);
                    var oGlobalBusyDialog = new sap.m.BusyDialog(); //PREPARA UM LOAD NA TELA
                    oGlobalBusyDialog.open();
                    //submit changes and refresh the table and display message
                    oModel.submitBatch(function (data) {
                        oModel.refresh();
                        oGlobalBusyDialog.close();
                        if (data.__batchResponses[0].__changeResponses) {
                            //MessageBox.confirm("Lançamento efetuado", {});
                            MessageBox.success("Dados gravados com sucesso!", {});
                            that.getView().getController()._onPageNavButtonPress();
                        } else {
                            var errorObj1 = jQuery.parseXML(data.__batchResponses[0].response.body).querySelector("message");
                            sap.m.MessageBox.show(
                                errorObj1.textContent,
                                sap.m.MessageBox.Icon.ERROR,
                                "Erro ao enviar os dados"
                            );
                        }
                    }, function (err) {
                        oGlobalBusyDialog.close();
                        var errorObj1 = jQuery.parseXML(err.response.body).querySelector("message");
                        sap.m.MessageBox.show(
                            errorObj1.textContent,
                            sap.m.MessageBox.Icon.ERROR,
                            "Erro ao enviar os dados"
                        );
                    });
                } else {
                    sap.m.MessageBox.show(
                        "Nenhuma há nenhum item",
                        sap.m.MessageBox.Icon.ERROR,
                        "Ocorreu um erro"
                    );
                }


            }, _salvar: function (oEvent) {
                var aItems = this.getView().byId("idTableItens").getContexts(),
                    // sVbeln = this._vbeln.getValue(),
                    oModel = this.getView().getModel(),
                    oOrdem = {
                        Vbeln: "",
                        Items: []
                    },
                    aOrdemVenda = [],
                    fator = this.getView().byId("fator").getValue();

                this.getView().getModel("objectView").setProperty("/processado", false);
                this.byId("btSalvar").setEnabled(false);
                this._oTable.setBusy(true);
                // Adiciona os itens modificados no objeto da Ordem
                aItems.forEach(function (oItem, index, obj) {
                    oOrdem.Vbeln = oItem.getObject().Vbeln;
                    oOrdem.Items.push(oItem.getObject());
                    aOrdemVenda.push(oItem.getObject());
                });
                //delete oOrdem.Items
                this.addBeforeUnload();

                oOrdem.Items.forEach(function (oItem) {
                    delete oItem.__metadata;
                    delete oItem.Ordem
                })

                aOrdemVenda.forEach(function (oItem) {
                    delete oItem.__metadata;
                    // delete oItem.Ordem
                })
                var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
                // Chama o CREATE da Ordem de Venda
                oModel.create("/OrdemSet", oOrdem, {
                    success: function (oData) {

                    }.bind(this),
                    error: function (oError) {
                        console.log("ordem: " + oOrdem.Vbeln + " NAO salva")
                        console.log(oError)
                        var objError = JSON.parse(oError.responseText);
                        /* sap.m.MessageBox.success(this.getResourceBundle().getText("msgErro",  objError.error.message.value), {
                             styleClass: bCompact ? "sapUiSizeCompact" : ""
                         });*/
                    }.bind(this)
                });
            },
            onEstoque: function (oEvent) {
                if (sap.ui.core.Fragment.byId("aDialogInsert", "iUtilizarLivre").getSelectedKey() == "true") {
                    sap.ui.core.Fragment.byId("aDialogInsert", "_IDGenLabel1").setVisible(false);
                    sap.ui.core.Fragment.byId("aDialogInsert", "iCartaoUnico").setVisible(false);
                    sap.ui.core.Fragment.byId("aDialogInsert", "iQtdDeCartao").setVisible(false);
                    sap.ui.core.Fragment.byId("aDialogInsert", "_IDGenLabel4").setVisible(false);
                } else {
                    sap.ui.core.Fragment.byId("aDialogInsert", "_IDGenLabel1").setVisible(true);
                    sap.ui.core.Fragment.byId("aDialogInsert", "iCartaoUnico").setVisible(true);
                    sap.ui.core.Fragment.byId("aDialogInsert", "iQtdDeCartao").setVisible(true);
                    sap.ui.core.Fragment.byId("aDialogInsert", "_IDGenLabel4").setVisible(true);
                }
            }
        });
    });
