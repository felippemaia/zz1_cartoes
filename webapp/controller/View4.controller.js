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
            vm = null,
            ValueNeutral = "";

        return Controller.extend("zz1cartoes.controller.View4", {
            onInit: function () {
                var oView = this.getView();
                var that = this;
                oView.addEventDelegate({
                    onBeforeShow: function () {
                        if (that.getOwnerComponent().getModel("detailDataView4") == undefined) {
                            that.getRouter().navTo("View1");
                        } else {

                            var oModel = new sap.ui.model.odata.ODataModel(serviceUrl);
                            var oView = this.getView();
                            oView.setModel(oModel);                            
                            var oContainer = that.getOwnerComponent().getModel("detailDataView4").getProperty("/");
    
                            //vm.getView().byId("page2").setTitle("Ordem: " + Orderid);
    
                            that.byId("tCWerks").setText(oContainer.iWerks);
                            that.byId("tCMatnr").setText(oContainer.iMatnr.padStart(18, "0"));
                            that.byId("tCDep").setText(oContainer.iDep);
                            that.byId("tCArea").setText(oContainer.iArea);

                            var filters = [];
                            filters.push(new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, oContainer.iMatnr.padStart(18, "0")));
            
                            oModel.read(
                                "TpFracionamentoSet", {
                                filters: filters,
                                success: function (oData) {
                                    if (oData.results.length > 0) {
                                        that.byId("tCFraci").setText(oData.results[0].ValueChar);
                                        ValueNeutral = oData.results[0].ValueNeutral;
                                    }
                                },
                                error: function () {
                                }
                            });
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
                this.getRouter().navTo("View1");
                var sData = [];
                var oJsonModel = new sap.ui.model.json.JSONModel(sData);
                this.getView().byId("idTableItens").setModel(oJsonModel);
                this.getView().byId("idTableItens").getModel().refresh();
            },
            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this);
            },
            accessFragment: function (oEvent) {

                if (!this.DialogInsertC) {
                    this.DialogInsertC = this.DialogInsertC = sap.ui.xmlfragment(
                        "aDialogInsertC",
                        "zz1cartoes.view.DialogInsertC",
                        this
                    );

                    //to get access to the global model
                    this.getView().addDependent(this.DialogInsertC);
                }
                sap.ui.core.Fragment.byId("aDialogInsertC", "iQtdDeCartao").setValueState("None");
                sap.ui.core.Fragment.byId("aDialogInsertC", "iQtdPorCartao").setValueState("None");
                sap.ui.core.Fragment.byId("aDialogInsertC", "iUn").setValueState("None");
                sap.ui.core.Fragment.byId("aDialogInsertC", "iQtdDeCartao").setValue("");
                sap.ui.core.Fragment.byId("aDialogInsertC", "iQtdPorCartao").setValue("");
                sap.ui.core.Fragment.byId("aDialogInsertC", "iUn").setValue("");
                this.DialogInsertC.open();

            },
            DialogInsertC_Cancel: function () {

                this.DialogInsertC.close();

            },
            onValidaCampos: function () {
                var retorno = 0;
                if (sap.ui.core.Fragment.byId("aDialogInsertC", "iQtdDeCartao").getValue() === "") {
                    sap.ui.core.Fragment.byId("aDialogInsertC", "iQtdDeCartao").setValueState("Error");
                    retorno = 1;
                }
                if (sap.ui.core.Fragment.byId("aDialogInsertC", "iQtdPorCartao").getValue() === "") {
                    sap.ui.core.Fragment.byId("aDialogInsertC", "iQtdPorCartao").setValueState("Error");
                    retorno = 1;
                }
                if (sap.ui.core.Fragment.byId("aDialogInsertC", "iUn").getValue() === "") {
                    sap.ui.core.Fragment.byId("aDialogInsertC", "iUn").setValueState("Error");
                    retorno = 1;
                }
                if (parseInt(sap.ui.core.Fragment.byId("aDialogInsertC", "iQtdPorCartao").getValue()) <= 0) {
                    sap.ui.core.Fragment.byId("aDialogInsertC", "iQtdPorCartao").setValueState("Error");
                    retorno = 2;
                }
                if (parseInt(sap.ui.core.Fragment.byId("aDialogInsertC", "iQtdDeCartao").getValue()) <= 0)    {
                    sap.ui.core.Fragment.byId("aDialogInsertC", "iQtdDeCartao").setValueState("Error");
                    retorno = 2;
                }
                             
                return retorno;
            },
            UpdateTableItens: function () {
                var campos = this.getView().getController().onValidaCampos();
                if (campos === 0) {
                    var iQtdDeCartao = sap.ui.core.Fragment.byId("aDialogInsertC", "iQtdDeCartao").getValue();
                    var iQtdPorCartao = sap.ui.core.Fragment.byId("aDialogInsertC", "iQtdPorCartao").getValue();
                    var iUn = sap.ui.core.Fragment.byId("aDialogInsertC", "iUn").getValue();

                    if (this.getView().byId("idTableItens").getModel().getData() === null ||
                    this.getView().byId("idTableItens").getModel().getData().length == 0) { //oModel === undefined) {
                        var sPath = {
                            "KanbanCardCompSet": [{
                                "Item": 1,
                                "QtdCartoes": iQtdDeCartao,
                                "QtdPCartao": iQtdPorCartao,
                                "UniMed": iUn,
                                "Status": "",
                            }]
                        };
                        var oJsonModel = new sap.ui.model.json.JSONModel(sPath);
                        this.getView().byId("idTableItens").setModel(oJsonModel);
                        this.getView().byId("idTableItens").getModel().refresh();
                        this.DialogInsertC.close();
                    } else {
                        var oData = this.getView().byId("idTableItens").getModel().getData();
                        var index = oData.KanbanCardCompSet.length;
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
                        oData.KanbanCardCompSet.push({
                            "Item": index,
                            "QtdCartoes": iQtdDeCartao,
                            "QtdPCartao": iQtdPorCartao,
                            "UniMed": iUn,
                            "Status": "",
                        });
                        this.getView().byId("idTableItens").getModel().refresh();
                        this.DialogInsertC.close();
                        //  }
                        //	}
                    }
               /* } else if(campos === 1) {
                    sap.m.MessageBox.show(
                        "É necessário preencher todos os campos obrigatórios",
                        sap.m.MessageBox.Icon.ERROR,
                        "Erro ao incluir registro"
                    );*/
                }else{
                    sap.m.MessageBox.show(
                        "O valor de todos os campos deve ser maior que 0",
                        sap.m.MessageBox.Icon.ERROR,
                        "Erro ao incluir registro"
                    );
                }
            },
            onDeleteTableItem: function () {
                var rowItems = this.getView().byId("idTableItens").getSelectedItems();
                var oData = this.getView().byId("idTableItens").getModel().getData();
                if (rowItems.length > 0) {
                    for (var i = 0; i < rowItems.length; i++) {
                        var item = rowItems[i];

                        oData.KanbanCardCompSet.map((obj, id) => {
                            if (obj.Item === parseInt(item.getCells()[0].getText())) {
                                oData.KanbanCardCompSet.splice(id, 1)
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
                var that = this;
                var oContainer = this.getOwnerComponent().getModel("detailDataView4").getProperty("/");
                var ValueChar = this.byId("tCFraci").getText();
                var rowAllItems =  this.getView().byId("idTableItens").getItems();
                var batchChanges = [];
                var oModel = this.getView().getModel();
                for (var i = 0; i < rowAllItems.length; i++) {
                    var item = rowAllItems[i];
                    var cells = item.getCells();
                    if (cells[0].getText() != "") {
                        var oEntry = {
                            Werks: oContainer.iWerks,
                            Matnr: oContainer.iMatnr.padStart(18, "0"),
                            Lgfsbc: oContainer.iDep,
                            Vspvbc: oContainer.iArea,
                            Item: cells[0].getText(),
                            QtdCartoes: cells[1].getText(),
                            QtdPCartao: cells[2].getText(),
                            UniMed: cells[3].getText(),
                            ValueNeutral: ValueNeutral,
                            ValueChar: ValueChar
                        };
                        batchChanges.push(oModel.createBatchOperation("/DeepKanbanCardCompSet", "POST", oEntry));
                    }
                }
                if (batchChanges.length !== 0) {
                    oModel.addBatchChangeOperations(batchChanges);
                    var oGlobalBusyDialog = new sap.m.BusyDialog(); //PREPARA UM LOAD NA TELA
                    oGlobalBusyDialog.open();
                    //submit changes and refresh the table and display message
                    oModel.submitBatch(function (data) {
                        oModel.refresh();
                        oGlobalBusyDialog.close();
                        if (data.__batchResponses[0].__changeResponses) {
                            that.getView().getController()._onImprimir();
                            //MessageBox.confirm("Lançamento efetuado", {});
                            MessageBox.success("Dados gravados com sucesso!", {});
                        } else {
                            var errorObj1 = jQuery.parseXML(data.__batchResponses[0].response.body).querySelector("message");
                            sap.m.MessageBox.show(
                                errorObj1.textContent,
                                sap.m.MessageBox.Icon.ERROR,
                                "Erro ao enviar os dados"
                            );
                        }
                    });
                } else {
                    sap.m.MessageBox.show(
                        "Nenhuma há nenhum item",
                        sap.m.MessageBox.Icon.ERROR,
                        "Ocorreu um erro"
                    );
                }


            },
            _onImprimir: function (oEvent) {
                /*if (!sap.ushell) {
                    var sServiceUrl1 = "/odata/SAP/ZBCGW_PORTAL_FIORI_SRV/";
                } else {
                    var sServiceUrl1 = "/sap/fiori/zdemonstrativopagamento/odata/SAP/ZBCGW_PORTAL_FIORI_SRV/";
                }*/
                //var rowItems = this.getView().byId("idTableItem").getSelectedItems();
                var oContainer = this.getOwnerComponent().getModel("detailDataView4").getProperty("/");

                var Matnr = oContainer.iMatnr.padStart(18, "0");
                var Werks = oContainer.iWerks;
                var Vspvbc = oContainer.iArea;
                var Lgfsbc = oContainer.iDep;
                var url = window.location.href.split("sap/");
                var oModel = new sap.ui.model.odata.ODataModel(serviceUrl, false);
                var filters = [];
                filters.push(new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, Matnr));
                filters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, Werks));
                filters.push(new sap.ui.model.Filter("Vspvbc", sap.ui.model.FilterOperator.EQ, Vspvbc));
                filters.push(new sap.ui.model.Filter("Lgfsbc", sap.ui.model.FilterOperator.EQ, Lgfsbc));

                var oGlobalBusyDialog = new sap.m.BusyDialog(); //PREPARA UM LOAD NA TELA
                oGlobalBusyDialog.open();
                oModel.read(
                    "KanbanCardCompSet", {
                    filters: filters,
                    success: function (oData) {
                        oGlobalBusyDialog.close();
                        if (oData.results.length > 0) {
                            /*var l_rspos = "";
                            for (var i = 0; i < oData.results.length; i++) {
                                if (l_rspos !== oData.results[0].Item) {*/
                                    var pdfUrl = url[0] + serviceUrl + "KanbanCardCompSet(Matnr='" + Matnr + "',Werks='" + Werks + "',Vspvbc='" +
                                    Vspvbc + "',Lgfsbc='" + Lgfsbc + "',Item='" + oData.results[0].Item + "')/$value";
                                    window.open(pdfUrl);
                                    l_rspos = oData.results[0].Item;
                               /* }
                            }*/
                        } else {
                            MessageBox.show("Nenhum dos itens selecionados possui cartões para impressão!", MessageBox.Icon.ERROR, "Ocorreu um erro");

                        }
                    },
                    error: function () {
                        oGlobalBusyDialog.close();
                        MessageBox.show("Sorry, Connection Problem!", MessageBox.Icon.ERROR, "Technical Problem");
                    }
                });
            }
        });
    });
