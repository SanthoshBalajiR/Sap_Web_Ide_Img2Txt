sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/BusyIndicator"
], function(Controller, MessageBox, BusyIndicator) {
	"use strict";

	return Controller.extend("Image2Text.controller.View1", {

		onInit: function() {
			if (sap.ui.Device.system.phone) {
				this.byId("HBox").setDirection("Column");
				this.byId("uploadedImage").setWidth("100%");
				this.byId("extractedText").setWidth("100%");
			}
		},

		onFileUpload: function(oEvent) {
			var oFileUploader = oEvent.getSource();
			var aFiles = oEvent.getParameter("files");

			if (aFiles && aFiles.length > 0) {
				var oFile = aFiles[0];
				this.readImageFile(oFile);
			}
		},

		readImageFile: function(oFile) {
			var oReader = new FileReader();
			oReader.onload = function(e) {
				var sImageData = e.target.result;
				this.extractTextFromImage(sImageData);
				this.byId("uploadedImage").setSrc(sImageData);
				this.byId("extractedText").setVisible(true);
				this.byId("extractedText").setValue("");
			}.bind(this);
			oReader.readAsDataURL(oFile);
		},

		extractTextFromImage: function(sImageData) {
			var that = this;
			BusyIndicator.show();
			var sApiUrl = "https://api.ocr.space/parse/image";
			var sApiKey = "K89768886288957";
			var sOcrEngine = "2";
			var bDetectOrientation = true;
			$.ajax({
				url: sApiUrl,
				type: "POST",
				dataType: "json",
				data: {
					apikey: sApiKey,
					language: "eng",
					base64Image: sImageData,
					OCREngine: sOcrEngine,
					detectOrientation: bDetectOrientation
				},
				success: function(data) {
					if (data && data.ParsedResults && data.ParsedResults.length > 0) {
						BusyIndicator.hide();
						var sExtractedText = data.ParsedResults[0].ParsedText;
						that.byId("extractedText").setValue(sExtractedText);
					} else {
						BusyIndicator.hide();
						MessageBox.error("No text extracted from the image.");
					}
				},
				error: function(error) {
					BusyIndicator.hide();
					MessageBox.error("OCR API Error:", error);
					that.byId("uploadedImage").setSrc("");
					that.byId("extractedText").setValue("");
				}
			});
		},
	});
});