package ntua.thesis.dis.linking;

import java.io.File;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.Map.Entry;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import ntua.thesis.dis.util.ProjectFileUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;


public class SilkLSLFile {

        private DocumentBuilderFactory docFactory;
        private DocumentBuilder docBuilder;
        private Document document;
        private Element rootElement;
        
        private String sourceFileLocation;
        private String targetFileLocation;
        private String acceptedLinksFileLocation;
        private String verifyLinksFileLocation;
        private String sourceId;
        private String targetId;
        private String linkID;
        /*private String filterLimit;*/
        
        private File fileLocation;
         
        public SilkLSLFile(String silkFileLocation,String sourceFileLocation, String targetFileLocation, 
                           String acceptedLinksFileLocation,String verifyLinksFileLocation,
                           String linkId) {
                
                this.sourceFileLocation = sourceFileLocation;
                this.targetFileLocation = targetFileLocation;
                this.verifyLinksFileLocation = verifyLinksFileLocation;
                this.acceptedLinksFileLocation = acceptedLinksFileLocation;
                this.linkID = linkId;
                this.fileLocation = Paths.get(silkFileLocation).toFile();
                
                
                docFactory = DocumentBuilderFactory.newInstance();
                try {
                        docBuilder = docFactory.newDocumentBuilder();
                } catch (ParserConfigurationException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                document = docBuilder.newDocument();
                rootElement = document.createElement("Silk");
                document.appendChild(rootElement);
        }

        public void save() {
                TransformerFactory transformerFactory = TransformerFactory.newInstance();
                Transformer transformer;
                try {
                        transformer = transformerFactory.newTransformer();
                        DOMSource source = new DOMSource(document);
                        //StreamResult result = new StreamResult(System.out);
                        StreamResult result = new StreamResult(fileLocation);
                        
                        transformer.transform(source, result);
                } catch (TransformerException e1) {
                        // TODO Auto-generated catch block
                        e1.printStackTrace();
                }
                
        }
        
        public File getLocation() {
                return fileLocation;
        }
        
        
        public void writeDatasources(){
                String filename = "";
                Element sourcesElement = document.createElement("DataSources");
                filename = ProjectFileUtils.getFilename(sourceFileLocation);
                sourceId = getName(filename);//extractFilenameFromFileLocation(sourceFileLocation);
                Element dataSource1 = writeDatasource(sourceFileLocation,sourceId);    
                sourcesElement.appendChild(dataSource1);         
                filename = ProjectFileUtils.getFilename(targetFileLocation);//extractFilenameFromFileLocation(targetFileLocation);
                targetId = getName(filename);
                Element dataSource2 = writeDatasource(targetFileLocation,targetId);        
                sourcesElement.appendChild(dataSource2);            
                rootElement.appendChild(sourcesElement);     
        }
        
        public Element writeFilter(String threshold,String limit){
                
                Element filterElement = document.createElement("Filter");
                if(!threshold.equals("")){
                        filterElement.setAttribute("threshold", threshold);
                }
                if(!limit.equals("")){
                        filterElement.setAttribute("limit", limit);
                }
                return filterElement;
                //rootElement.appendChild(filterElement);
        }

        private Element writeDatasource(String fileLocation,String id) {
                
                Element dataSource = document.createElement("DataSource");
                
                
                dataSource.setAttribute("id", id);
                dataSource.setAttribute("type", "file");
                
                Element paramElement1 = document.createElement("Param");
                paramElement1.setAttribute("value",fileLocation);
                paramElement1.setAttribute("name","file");
                
                Element paramElement2 = document.createElement("Param");
                paramElement2.setAttribute("value","N-TRIPLE");
                paramElement2.setAttribute("name","format");
                
                dataSource.appendChild(paramElement1);
                dataSource.appendChild(paramElement2);
                return dataSource;
        }

        public void writeOutputs(String xmlAcceptedFile,String xmlVerifyFile,String acceptMinConf,String acceptMaxConf,
                        String verifyMinConf,String verifyMaxConf){
                
                
                acceptMaxConf = this.modifyMaxAcceptance(acceptMaxConf);
                verifyMaxConf = this.modifyMaxAcceptance(verifyMaxConf);
                
                Element outputsElement = document.createElement("Outputs");
                
                Element output1 = writeOutput(acceptedLinksFileLocation,acceptMinConf,acceptMaxConf,0);
                outputsElement.appendChild(output1);
                Element output3 = writeOutput(xmlAcceptedFile,acceptMinConf,acceptMaxConf,1);
                outputsElement.appendChild(output3);
                Element output2 = writeOutput(verifyLinksFileLocation,verifyMinConf,verifyMaxConf,0);
                outputsElement.appendChild(output2);
                
                Element output4 = writeOutput(xmlVerifyFile,verifyMinConf,verifyMaxConf,1);
                outputsElement.appendChild(output4);
                
                rootElement.appendChild(outputsElement);
        }
        

        private String modifyMaxAcceptance(String acceptMaxConf) {
                // TODO Auto-generated method stub
                Double acceptance = Double.parseDouble(acceptMaxConf);
                if(acceptance == 1){
                        return "1.1";
                }else{
                        return acceptMaxConf;
                }
                
        }

        private Element writeOutput(String fileLocation,String minConf,String maxConf,int outputFormat) {
                
                String format;
                if(outputFormat == 1){
                        format = "alignment";
                }else{
                        format = "ntriples";
                }
                
                Element output = document.createElement("Output");
                output.setAttribute("type", "file");
                output.setAttribute("maxConfidence", maxConf);
                output.setAttribute("minConfidence", minConf);
                Element paramElement1 = document.createElement("Param");
                paramElement1.setAttribute("name","file");
                paramElement1.setAttribute("value",fileLocation);
                Element paramElement2 = document.createElement("Param");
                paramElement2.setAttribute("name","format");
                paramElement2.setAttribute("value",format);
                output.appendChild(paramElement1);
                output.appendChild(paramElement2);
                return output;
        }
        
        public void writePrefixes(Iterator<Entry<String, String>> it) {
  
                Element prefixesElement = document.createElement("Prefixes");
                
                while(it.hasNext()){
                        Entry<String, String> prefixEntry = it.next();
                        Element prefixElement = document.createElement("Prefix");
                        // only these a prefix can contain : a - z, A - Z, 0 - 9, _, -
                        //System.out.println("PREFIX > "+prefixEntry.getKey()+ " MATCHES RULE > "+
                       // prefixEntry.getKey().matches("^[a-zA-Z0-9[_][-]]+"));
                        
                        if(!prefixEntry.getKey().matches("^[a-zA-Z0-9[_][-]]+")){
                                continue;
                        }
                        
                        prefixElement.setAttribute("id",prefixEntry.getKey());
                        prefixElement.setAttribute("namespace",prefixEntry.getValue());
                        prefixesElement.appendChild(prefixElement);
                }
                rootElement.appendChild(prefixesElement);
        }
        
        
        public void writeInterlinks(String sourcePattern,String targetPattern,
                                        String sourceVar,String targetVar,
                                        LinkageRule linkRule,String limit,String threshold){
                
                Element interlinks = document.createElement("Interlinks");
                Element interlink = writeInterlink(sourcePattern,targetPattern,sourceVar,targetVar,linkRule,limit,threshold);
                interlinks.appendChild(interlink);
                rootElement.appendChild(interlinks);
        }
        
        
        private Element writeInterlink(String sourceRestrictToPattern,String targetRestrictToPattern,
                                       String sourceVar,String targetVar,LinkageRule linkRule,String limit,String threshold){
                
                Element interlink = document.createElement("Interlink");
                interlink.setAttribute("id",linkID);
                
                /***** link type xml element *****/
                Element linkType = document.createElement("LinkType");
                linkType.setTextContent("owl:sameAs");
                
                /***** source dataset xml element *****/
                Element sourceDataset = document.createElement("SourceDataset");
                sourceDataset.setAttribute("dataSource", sourceId);
                sourceDataset.setAttribute("var", sourceVar);
                Element sourceRestrict = document.createElement("RestrictTo");
                sourceRestrict.setTextContent(sourceRestrictToPattern);
                sourceDataset.appendChild(sourceRestrict);
                
                /***** target dataset xml element *****/
                Element targetDataset = document.createElement("TargetDataset");
                targetDataset.setAttribute("dataSource", targetId);
                targetDataset.setAttribute("var", targetVar);
                Element targetRestrict = document.createElement("RestrictTo");
                targetRestrict.setTextContent(targetRestrictToPattern);
                targetDataset.appendChild(targetRestrict);
                
                /***** linkage rule element *****/
                Element linkageRule = linkRule.writeTo(document);
    
                /********** filter *******************/
                //Element filter = document.createElement("Filter");
                interlink.appendChild(linkType);
                interlink.appendChild(sourceDataset);
                interlink.appendChild(targetDataset);
                interlink.appendChild(linkageRule);   
                interlink.appendChild(this.writeFilter(threshold, limit));
                //interlink.appendChild(filter);
                return interlink;
        }

        public void writeBlocking(){
                Element blocking = document.createElement("Blocking");
                rootElement.appendChild(blocking);
        }
        
        private String getName(String filename) {
                
                int extensionPos = filename.lastIndexOf('.');
                return filename.substring(0,extensionPos);
        }

}
