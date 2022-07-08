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
        return Controller.extend("zz1cartoes.controller.View2", {
            onInit: function () {
                var oView = this.getView();
                var vm = this;
                var oModel = new sap.ui.model.odata.ODataModel(serviceUrl);
                var oView = this.getView();
                oView.setModel(oModel);
                oView.addEventDelegate({
                    onBeforeShow: function () {
                        if (vm.getOwnerComponent().getModel("detailData") == undefined) {
                            vm.getRouter().navTo("View1");
                        } else {
                            var oContainer = vm.getOwnerComponent().getModel("detailData").getProperty("/");

                            //var Orderid = oContainer.Orderid;

                            //vm.getView().byId("page2").setTitle("Ordem: " + Orderid);

                            vm.byId("tWERKS").setText(oContainer.Werks);
                            vm.byId("tAUFNR").setText(oContainer.Aufnr);
                            vm.byId("tReserva").setText(oContainer.Rsnum);
                            vm.byId("tProduto").setText(oContainer.Matnr + "-" + oContainer.Maktx);

                            vm.byId("tLgt").setText(oContainer.Lgfsb + "-" + oContainer.Lgobe);
                            vm.byId("tArea").setText(oContainer.Vspvb);

                            var filters = [];
                            filters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, oContainer.Werks));

                            filters.push(new sap.ui.model.Filter("Aufnr", sap.ui.model.FilterOperator.EQ, oContainer.Aufnr.padStart(12, "0")));

                            filters.push(new sap.ui.model.Filter("Rsnum", sap.ui.model.FilterOperator.EQ, oContainer.Rsnum));

                            filters.push(new sap.ui.model.Filter("Lgfsb", sap.ui.model.FilterOperator.EQ, oContainer.Lgfsb));

                            vm.byId("idTableItem").getBinding("items").filter(filters);
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
                this.byId("idTableItem").removeSelections();
                this.getRouter().navTo("View1");
            },
            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this);
            },
            _onTablePress: function (oEvent) {
                var oObject = oEvent.getParameter("listItem").getBindingContext().getObject();
                var oComponent = this.getOwnerComponent();
                oComponent.setModel(new JSONModel(oObject), "detailDataView2");
                this.getRouter().navTo("View3");
            },
            _onImprimir: function (oEvent) {
                /*if (!sap.ushell) {
                    var sServiceUrl1 = "/odata/SAP/ZBCGW_PORTAL_FIORI_SRV/";
                } else {
                    var sServiceUrl1 = "/sap/fiori/zdemonstrativopagamento/odata/SAP/ZBCGW_PORTAL_FIORI_SRV/";
                }*/
                var rowItems = this.getView().byId("idTableItem").getSelectedItems();
                var oContainer = this.getOwnerComponent().getModel("detailData").getProperty("/");

                var Aufnr = oContainer.Aufnr.padStart(12, "0");
                var Werks = oContainer.Werks;
                var Rsnum = oContainer.Rsnum.padStart(10, "0");
                var Rspos = '';
                var aItemUpd = [];
                var Lgfsb = oContainer.Lgfsb;
                var url = window.location.href.split("sap/");
                var oModel = new sap.ui.model.odata.ODataModel(serviceUrl, false);
                var imprimir = false;
                var filters = [];
                filters.push(new sap.ui.model.Filter("Aufnr", sap.ui.model.FilterOperator.EQ, Aufnr));
                filters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, Werks));
                filters.push(new sap.ui.model.Filter("Rsnum", sap.ui.model.FilterOperator.EQ, Rsnum));
                filters.push(new sap.ui.model.Filter("Lgfsb", sap.ui.model.FilterOperator.EQ, Lgfsb));

                for (var i = 0; i < rowItems.length; i++) {
                    var item = rowItems[i].getBindingContext().getObject();
                    if (item) {
                        Rspos = item.Rspos;
                        if (item.UtilizarEstoque == "") {
                            imprimir = true;
                            filters.push(new sap.ui.model.Filter("Rspos", sap.ui.model.FilterOperator.EQ, Rspos));
                        } else {
                            aItemUpd.push(item);
                        }
                        /* 
                         
                         var pdfUrl = url[0] + "sap" + serviceUrl + "KanbanCardSet(Aufnr='" + Aufnr + "',Werks='" + Werks + "',Rsnum='" +
                         Rsnum + "',Rspos='" + Rspos + "',Lgfsb='" + Lgfsb + "')/$value";
                         window.open(pdfUrl);*/
                    }
                }
                if (imprimir == true) {
                    var oGlobalBusyDialog = new sap.m.BusyDialog(); //PREPARA UM LOAD NA TELA
                    oGlobalBusyDialog.open();
                    oModel.read(
                        "KanbanCardSet", {
                        filters: filters,
                        success: function (oData) {
                            oGlobalBusyDialog.close();
                            if (oData.results.length > 0) {
                                var l_rspos = "";
                                for (var i = 0; i < oData.results.length; i++) {
                                    if (l_rspos !== oData.results[i].Rspos) {
                                        var pdfUrl = url[0] + serviceUrl + "KanbanCardSet(Aufnr='" + Aufnr + "',Werks='" + Werks + "',Rsnum='" +
                                            Rsnum + "',Rspos='" + oData.results[i].Rspos + "',Item='" + '0000' + "')/$value";
                                        window.open(pdfUrl);
                                        l_rspos = oData.results[i].Rspos;
                                    }
                                }
                            } else {
                                MessageBox.show("Nenhum dos itens selecionados possui cartões para impressão!", MessageBox.Icon.ERROR, "Ocorreu um erro");

                            }
                        },
                        error: function (err) {
                            oGlobalBusyDialog.close();
                            var errorObj1 = jQuery.parseXML(err.response.body).querySelector("message");
                            sap.m.MessageBox.show(
                                errorObj1.textContent,
                                sap.m.MessageBox.Icon.ERROR,
                                "Erro ao enviar os dados"
                            );
                            //MessageBox.show("Sorry, Connection Problem!", MessageBox.Icon.ERROR, "Technical Problem");
                        }
                    });
                }
                if (aItemUpd.length > 0) {
                    this.getView().getController().onUpdateItem(aItemUpd);
                }
            },
            onUpdateItem: function (oItemUpd) {
                var batchChanges = [];
                var oModel = new sap.ui.model.odata.ODataModel(serviceUrl);
                var aEntry = []
                for (var i = 0; i < oItemUpd.length; i++) {
                    var item = oItemUpd[i];
                    var oEntry = {
                        Aufnr: item.Aufnr,
                        Werks: item.Werks,
                        Rsnum: item.Rsnum,
                        Rspos: item.Rspos,
                        Lgfsb: item.Lgfsb,
                        Vspvb: item.Vspvb,
                        Matnr: item.Matnr.padStart(18, "0"),
                        Meins: item.Meins,
                        Multiplo: item.Multiplo.trim()
                    };
                    aEntry.push(oEntry)
                    batchChanges.push(oModel.createBatchOperation("/ProductionOrderItemSet", "POST", oEntry));
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
                            MessageBox.success("Estoque fabrica utilizado com sucesso!", {});
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


            },
            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },
            onExport: function (oEvent) {
                var table = this.oView.byId("idTableItem");
                var oBinding = table.getBinding("items");
                var oExport = new Export({

                    // Type that will be used to generate the content. Own ExportType's can be created to support other formats
                    exportType: new ExportTypeCSV({
                        separatorChar: ";"
                    }),

                    // Pass in the model created above
                    models: table.getModel(),

                    // binding information for the rows aggregation
                    rows: {
                        path: "/ProductionOrderItemSet",
                        filters: oBinding.aFilters
                    },

                    // column definitions with column name and binding info for the content
                    columns: [{
                        name: this.getResourceBundle().getText("lblItem"),
                        template: {
                            content: "{Rspos}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblStatus"),
                        template: {
                            content: "{StatusComponente}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblComponent"),
                        template: {
                            content: "{Matnr}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblDescComponent"),
                        template: {
                            content: "{Maktx}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblQtdCompo"),
                        template: {
                            content: "{Dbmng}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblTpFracionamento"),
                        template: {
                            content: "{ValueChar}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblCartaoUnico"),
                        template: {
                            content: "{Unico}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblQtdPorCartao"),
                        template: {
                            content: "{Multiplo}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblUtilizarLivre"),
                        template: {
                            content: "{UtilizarEstoque}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblQtdCartaoSu"),
                        template: {
                            content: "{NumKanban}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblQtdCartao"),
                        template: {
                            content: "{QtdKanban}"
                        }
                    }]
                });

                // download exported file
                oExport.saveFile().catch(function (oError) {
                    MessageBox.error("Not supported Browser!\n\n" + oError);
                }).then(function () {
                    oExport.destroy();
                });
            },
        });
    });
