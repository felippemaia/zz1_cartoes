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
        return Controller.extend("zz1cartoes.controller.View5", {
            onInit: function () {
                var oView = this.getView();
                var that = this;
                oView.addEventDelegate({
                    onBeforeShow: function () {
                        if (that.getOwnerComponent().getModel("detailDataView5") == undefined) {
                            that.getRouter().navTo("View1");
                        } else {

                            var oModel = new sap.ui.model.odata.ODataModel(serviceUrl);
                            var oView = this.getView();
                            oView.setModel(oModel);                            
                            var oContainer = that.getOwnerComponent().getModel("detailDataView5").getProperty("/");
    
                            //vm.getView().byId("page2").setTitle("Ordem: " + Orderid);
    
                            that.byId("tCWerks").setText(oContainer.iWerks);
                            that.byId("tCArea").setText(oContainer.iArea);

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

                if (!this.DialogInsertD) {
                    this.DialogInsertD = this.DialogInsertD = sap.ui.xmlfragment(
                        "aDialogInsertD",
                        "zz1cartoes.view.DialogInsertD",
                        this
                    );

                    //to get access to the global model
                    this.getView().addDependent(this.DialogInsertD);
                }
                sap.ui.core.Fragment.byId("aDialogInsertD", "iMatnr").setValueState("None");
                sap.ui.core.Fragment.byId("aDialogInsertD", "iQtdDeCartao").setValueState("None");
                sap.ui.core.Fragment.byId("aDialogInsertD", "iQtdPorCartao").setValueState("None");
                sap.ui.core.Fragment.byId("aDialogInsertD", "iUn").setValueState("None");
                sap.ui.core.Fragment.byId("aDialogInsertD", "iMatnr").setValue("");
                sap.ui.core.Fragment.byId("aDialogInsertD", "iQtdDeCartao").setValue("");
                sap.ui.core.Fragment.byId("aDialogInsertD", "iQtdPorCartao").setValue("");
                sap.ui.core.Fragment.byId("aDialogInsertD", "iUn").setValue("");
                this.DialogInsertD.open();

            },
            DialogInsertD_Cancel: function () {

                this.DialogInsertD.close();

            },
            onValidaCampos: function () {
                var retorno = 0;
                if (sap.ui.core.Fragment.byId("aDialogInsertD", "iUtilizarLivre").getSelectedKey() == "true") {
                    sap.ui.core.Fragment.byId("aDialogInsertD", "iQtdDeCartao").setValue("Estoque de fábrica")
                }
                if (sap.ui.core.Fragment.byId("aDialogInsertD", "iMatnr").getValue() === "") {
                    sap.ui.core.Fragment.byId("aDialogInsertD", "iMatnr").setValueState("Error");
                    retorno = 1;
                }
                if (sap.ui.core.Fragment.byId("aDialogInsertD", "iQtdDeCartao").getValue() === "") {
                    sap.ui.core.Fragment.byId("aDialogInsertD", "iQtdDeCartao").setValueState("Error");
                    retorno = 1;
                }
                if (sap.ui.core.Fragment.byId("aDialogInsertD", "iQtdPorCartao").getValue() === "") {
                    sap.ui.core.Fragment.byId("aDialogInsertD", "iQtdPorCartao").setValueState("Error");
                    retorno = 1;
                }
                if (sap.ui.core.Fragment.byId("aDialogInsertD", "iUn").getValue() === "") {
                    sap.ui.core.Fragment.byId("aDialogInsertD", "iUn").setValueState("Error");
                    retorno = 1;
                }
                if (parseInt(sap.ui.core.Fragment.byId("aDialogInsertD", "iQtdPorCartao").getValue()) <= 0) {
                    sap.ui.core.Fragment.byId("aDialogInsertD", "iQtdPorCartao").setValueState("Error");
                    retorno = 2;
                }
                if (parseInt(sap.ui.core.Fragment.byId("aDialogInsertD", "iQtdDeCartao").getValue()) <= 0)    {
                    sap.ui.core.Fragment.byId("aDialogInsertD", "iQtdDeCartao").setValueState("Error");
                    retorno = 2;
                }
                             
                return retorno;
            },
            UpdateTableItens: function () {
                var iUtilizarLivre = "";
                var campos = this.getView().getController().onValidaCampos();
                if (campos === 0) {
                    var iMatnr = sap.ui.core.Fragment.byId("aDialogInsertD", "iMatnr").getValue();
                    var iQtdDeCartao = sap.ui.core.Fragment.byId("aDialogInsertD", "iQtdDeCartao").getValue();
                    var iQtdPorCartao = sap.ui.core.Fragment.byId("aDialogInsertD", "iQtdPorCartao").getValue();
                    var iUn = sap.ui.core.Fragment.byId("aDialogInsertD", "iUn").getValue();
                    if (sap.ui.core.Fragment.byId("aDialogInsertD", "iUtilizarLivre").getSelectedKey() === 'true') {
                        iUtilizarLivre = "X";
                    }
                    if (this.getView().byId("idTableItens").getModel().getData() === null||
                    this.getView().byId("idTableItens").getModel().getData().length == 0) { //oModel === undefined) {
                        var sPath = {
                            "KanbanCardDevSet": [{
                                "Item": 1,
                                "Matnr": iMatnr,
                                "QtdCartoes": iQtdDeCartao,
                                "QtdPCartao": iQtdPorCartao,
                                "UniMed": iUn,
                                "UtilizarEstoque": iUtilizarLivre,
                                "Status": "",
                            }]
                        };
                        var oJsonModel = new sap.ui.model.json.JSONModel(sPath);
                        this.getView().byId("idTableItens").setModel(oJsonModel);
                        this.getView().byId("idTableItens").getModel().refresh();
                        this.DialogInsertD.close();
                    } else {
                        var oData = this.getView().byId("idTableItens").getModel().getData();
                        var index = oData.KanbanCardDevSet.length;
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
                        oData.KanbanCardDevSet.push({
                            "Item": index,
                            "Matnr": iMatnr,
                            "QtdCartoes": iQtdDeCartao,
                            "QtdPCartao": iQtdPorCartao,
                            "UniMed": iUn,
                            "UtilizarEstoque": iUtilizarLivre,
                            "Status": "",
                        });
                        this.getView().byId("idTableItens").getModel().refresh();
                        this.DialogInsertD.close();
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

                        oData.KanbanCardDevSet.map((obj, id) => {
                            if (obj.Item === parseInt(item.getCells()[0].getText())) {
                                oData.KanbanCardDevSet.splice(id, 1)
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
                var oContainer = this.getOwnerComponent().getModel("detailDataView5").getProperty("/");
                var rowAllItems =  this.getView().byId("idTableItens").getItems();
                var batchChanges = [];
                var oModel = this.getView().getModel();
                var qtd = "";
                for (var i = 0; i < rowAllItems.length; i++) {
                    var item = rowAllItems[i];
                    var cells = item.getCells();
                    if (cells[0].getText() != "") {
                        if (cells[2].getText() == "Estoque de fábrica") {
                            qtd = "0"
                        } else {
                            qtd = cells[2].getText();
                        }
                        var oEntry = {
                            Werks: oContainer.iWerks,
                            Vspvbc: oContainer.iArea,
                            Item: cells[0].getText(),
                            Matnr: cells[1].getText().padStart(18, "0"),
                            QtdCartoes: qtd,
                            QtdPCartao: cells[3].getText(),
                            UniMed: cells[4].getText()
                        };
                        batchChanges.push(oModel.createBatchOperation("/DeepKanbanCardDevSet", "POST", oEntry));
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
                var oContainer = this.getOwnerComponent().getModel("detailDataView5").getProperty("/");

                //var Matnr = oContainer.iMatnr.padStart(18, "0");
                var Werks = oContainer.iWerks;
                var Vspvbc = oContainer.iArea;
                //var Lgfsbc = oContainer.iDep;
                var url = window.location.href.split("sap/");
                var oModel = new sap.ui.model.odata.ODataModel(serviceUrl, false);
                var filters = [];
                //filters.push(new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, Matnr));
                filters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, Werks));
                filters.push(new sap.ui.model.Filter("Vspvbc", sap.ui.model.FilterOperator.EQ, Vspvbc));
                //filters.push(new sap.ui.model.Filter("Lgfsbc", sap.ui.model.FilterOperator.EQ, Lgfsbc));

                var oGlobalBusyDialog = new sap.m.BusyDialog(); //PREPARA UM LOAD NA TELA
                oGlobalBusyDialog.open();
                oModel.read(
                    "KanbanCardDevSet", {
                    filters: filters,
                    success: function (oData) {
                        oGlobalBusyDialog.close();
                        if (oData.results.length > 0) {
                            /*var l_rspos = "";
                            for (var i = 0; i < oData.results.length; i++) {
                                if (l_rspos !== oData.results[0].Item) {*/
                                    var pdfUrl = url[0] + serviceUrl + "KanbanCardDevSet(Werks='" + Werks + "',Vspvbc='" +
                                    Vspvbc + "')/$value";
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
            },
            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },
            _valueHelpRequest: function (oEvent, oOptions) {
                var oSettings = {
                    title: "",
                    key: "",
                    descriptionKey: "",
                    multiselect: true,
                    path: "",
                    cols: [],
                    filters: [],
                    ok: null
                };
                jQuery.extend(oSettings, oOptions);

                var oInput = oEvent.getSource(),
                    aTokens;

                if (oInput.getTokens) {
                    aTokens = oInput.getTokens();
                }
                var that = this;
                var oValueHelpDialog = new ValueHelpDialog({
                    basicSearchText: oInput.getValue(),
                    title: oSettings.title,
                    supportMultiselect: oSettings.multiselect,
                    supportRanges: oSettings.multiselect,
                    supportRangesOnly: oSettings.multiselect && !oSettings.path,
                    key: oSettings.key,
                    descriptionKey: oSettings.descriptionKey,
                    stretch: sap.ui.Device.system.phone,

                    ok: function (oControlEvent) {
                        aTokens = oControlEvent.getParameter("tokens");

                        if (oInput.setTokens) {
                            oInput.setValue(aTokens[0].getKey());
                        } else {
                            oInput.setValue(aTokens[0].getKey());
                        }

                        if (oSettings.ok) {
                            oSettings.ok(oControlEvent);
                        }

                        oValueHelpDialog.close();
                    },

                    cancel: function (oControlEvent) {
                        oValueHelpDialog.close();
                    },

                    afterClose: function () {
                        oValueHelpDialog.destroy();
                    }
                });

                oValueHelpDialog.setMaxExcludeRanges(0);
                oValueHelpDialog.setRangeKeyFields([{
                    label: oSettings.title,
                    key: oSettings.key
                }]);
                if (aTokens) {
                    oValueHelpDialog.setTokens(aTokens);
                }

                if (oSettings.path) {
                    var oTable = oValueHelpDialog.getTable(),
                        oColsModel = new sap.ui.model.json.JSONModel(),
                        oRowsModel = "";
                    if (oSettings.key == "Id") {
                        oRowsModel = this.getView().getModel("mock");
                    } else {
                        oRowsModel = this.getView().getModel();
                    }

                    oColsModel.setData({
                        cols: oSettings.cols
                    });
                    oTable.setModel(oColsModel, "columns");

                    oTable.setModel(oRowsModel);
                    if (oTable.bindRows) {
                        oTable.bindRows({
                            path: oSettings.path,
                            filters: oSettings.filters
                        });
                        oTable.setNoData(this.getResourceBundle().getText("noDataText"));
                    } else if (oTable.bindItems) {
                        oTable.bindItems({
                            path: oSettings.path,
                            filters: oSettings.filters,
                            factory: function (sId, oContext) {
                                var aCols = oTable.getModel("columns").getData().cols;

                                return new sap.m.ColumnListItem({
                                    cells: aCols.map(function (column) {
                                        var colname = column.template;
                                        return new sap.m.Label({
                                            text: "{" + colname + "}"
                                        });
                                    })
                                });
                            }
                        });
                        oTable.setNoDataText(this.getResourceBundle().getText("noDataText"));
                    }

                    var aFilterGroupItems = [];
                    for (var i = 0; i < oSettings.cols.length; i++) {
                        aFilterGroupItems.push(new sap.ui.comp.filterbar.FilterGroupItem({
                            groupName: "group",
                            name: oSettings.cols[i].label,
                            label: oSettings.cols[i].label,
                            control: new sap.m.Input()
                        }));
                    }

                    var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
                        advancedMode: true,
                        filterBarExpanded: false,
                        showGoOnFB: !sap.ui.Device.system.phone,
                        filterGroupItems: aFilterGroupItems,
                        search: function (oControlEvent) {
                            var aSelections = oControlEvent.getParameters().selectionSet,
                                aFilters = [];
                            for (i = 0; i < aSelections.length; i++) {
                                var sValue = aSelections[i].getValue();
                                if (sValue) {
                                    aFilters.push(new Filter(oSettings.cols[i].template, FilterOperator.Contains, sValue));
                                }
                            }

                            if (oTable.bindRows) {
                                oTable.getBinding("rows").filter(aFilters);
                            } else {
                                oTable.getBinding("items").filter(aFilters);
                            }
                        }
                    });
                    if (oFilterBar.setBasicSearch) {
                        oFilterBar.setBasicSearch(new sap.m.SearchField({
                            showSearchButton: sap.ui.Device.system.phone,
                            placeholder: "Search",
                            visible: false,
                            search: function (event) {
                                oValueHelpDialog.getFilterBar().search();
                            }
                        }));
                    }
                    oValueHelpDialog.setFilterBar(oFilterBar);
                }

                if (oInput.$().closest(".sapUiSizeCompact").length > 0) {
                    oValueHelpDialog.addStyleClass("sapUiSizeCompact");
                } else {
                    oValueHelpDialog.addStyleClass("sapUiSizeCozy");
                }

                oValueHelpDialog.open();
                oValueHelpDialog.update();
            },
            onMatnrSingleValueHelp: function (oEvent) {
                var aFilters = [],
                    oContext = oEvent.getSource().getBindingContext();
                //sVbeln = oContext.getProperty("Vbeln");
                //aFilters.push(new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, sVbeln));

                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblMaterial"),
                    key: "Matnr",
                    descriptionKey: "Maktx",
                    multiselect: false,
                    path: "/MaterialHelpSet",
                    cols: [{
                        label: this.getResourceBundle().getText("lblMaterial"),
                        template: "Matnr"
                    }, {
                        label: this.getResourceBundle().getText("lblMATNR"),
                        template: "Maktx"
                    }]//,
                    //filters: aFilters
                })
            },
            onEstoque: function (oEvent) {
                if (sap.ui.core.Fragment.byId("aDialogInsertD", "iUtilizarLivre").getSelectedKey() == "true") {
                    sap.ui.core.Fragment.byId("aDialogInsertD", "_IDGenLabel4").setVisible(false);
                    sap.ui.core.Fragment.byId("aDialogInsertD", "iQtdDeCartao").setVisible(false);
                } else {
                    sap.ui.core.Fragment.byId("aDialogInsertD", "_IDGenLabel4").setVisible(true);
                    sap.ui.core.Fragment.byId("aDialogInsertD", "iQtdDeCartao").setVisible(true);
                }
            }
        });
    });
