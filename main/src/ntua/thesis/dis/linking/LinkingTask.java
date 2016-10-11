package ntua.thesis.dis.linking;



import java.util.ArrayList;
import java.util.HashMap;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Model;

import de.fuberlin.wiwiss.silk.Silk;

import ntua.thesis.dis.dataspace.Dataset;
import ntua.thesis.dis.util.SPARQLUtils;



public class LinkingTask {

        private JSONObject userInput;
        private Dataset sourceDataset;
        private Dataset targetDataset;
        private String linkID;
        private String acceptedLinksFileLocation;
        private String verifyLinksFileLocation;
        private String xmlAcceptedLinksFileLocation;
        private String xmlVerifyLinksFileLocation;
        private HashMap<String, String> prefixesMap;
        private SilkLSLFile silkfile;   
        private String silkfileLocation;
        private JSONArray acceptedLinks;
        private String linkingTaskName;
        private ArrayList<String> inputPaths = new ArrayList<String>();
        private Model sourceDatasetModel;
        private Model targetDatasetModel;
        
        public LinkingTask(String name,Dataset source, Dataset target, JSONObject userInput_o){
                
                this.linkingTaskName = name;
                this.sourceDataset = source;
                this.targetDataset = target;
                this.linkID = name;//sourceDataset.getFile().toString()+"_to_"+
                              //targetDataset.getFile().toString();
                this.userInput = userInput_o;
                
                //this.silkfileLocation = "C:/Users/John/Desktop/data/linkSpec.xml";
                //this.acceptedLinksFileLocation = outputLinksLocation;
                //this.verifyLinksFileLocation = outputLinksLocation;
                //this.silkfileLocation = linkFileLocation;
        }
         
        public void setPrefixes(HashMap<String, String> commonVocabularyPrefixesMap) {
                prefixesMap = commonVocabularyPrefixesMap;
                prefixesMap.put("owl", "http://www.w3.org/2002/07/owl#");
               // prefixesMap.put("j.0","http://localhost/dataset/def#");
        }
        
        public void setLinkingFileLocation(String location) {
                
                this.silkfileLocation = location;
        }
        
        public String getName(){
                return this.linkingTaskName;
        }
        
        public void setOutputLinksLocation(String outputLinksLocation) {
               
                this.acceptedLinksFileLocation = outputLinksLocation + "\\" + this.linkingTaskName + "." + "acceptedLinks.nt";
                this.verifyLinksFileLocation = outputLinksLocation + "\\" + this.linkingTaskName + "." + "verifiedLinks.nt";
                this.xmlAcceptedLinksFileLocation = outputLinksLocation + "\\" + this.linkingTaskName + "." + "acceptedLinks.xml";
                this.xmlVerifyLinksFileLocation = outputLinksLocation + "\\" + this.linkingTaskName + "." + "verifiedLinks.xml";
        }

        
        
        private void createLinkingFile() {
                 
                silkfile = new SilkLSLFile(silkfileLocation,
                                           sourceDataset.getFile().toString(),
                                           targetDataset.getFile().toString(),
                                           acceptedLinksFileLocation,
                                           verifyLinksFileLocation,
                                           linkID);
                silkfile.writePrefixes(prefixesMap.entrySet().iterator());
                silkfile.writeDatasources();
                String sourcePattern = "";
                String targetPattern = "";
                String sourceVar = "";
                String targetVar = "";
                JSONObject linkageRule_o = new JSONObject();
                String acceptMinConf = "";
                String acceptMaxConf = "";
                String verifyMinConf = "";
                String verifyMaxConf = "";
                String threshold = "";
                String limit = "";
                try {
                        sourcePattern = userInput.getString("sourceRestrictTo");
                        targetPattern = userInput.getString("targetRestrictTo");
                        sourceVar = userInput.getString("sourceVar");
                        targetVar = userInput.getString("targetVar");
                        acceptMinConf = userInput.getString("acceptMinConf");
                        acceptMaxConf = userInput.getString("acceptMaxConf");
                        verifyMinConf = userInput.getString("verifyMinConf");
                        verifyMaxConf = userInput.getString("verifyMaxConf");
                        linkageRule_o = userInput.getJSONObject("linkSpec");
                        limit = userInput.getString("limit");
                        if(userInput.has("threshold")){
                                threshold = userInput.getString("threshold");
                        }
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                silkfile.writeBlocking();
                LinkageRule linkRule = new LinkageRule(linkageRule_o);
                silkfile.writeInterlinks(sourcePattern, targetPattern,sourceVar,targetVar, linkRule,limit,threshold);
                
                silkfile.writeOutputs(this.xmlAcceptedLinksFileLocation,this.xmlVerifyLinksFileLocation,acceptMinConf,acceptMaxConf,verifyMinConf,verifyMaxConf);
                silkfile.save();
                this.inputPaths = linkRule.getInputPaths();
                System.out.println("input paths are "+this.inputPaths.get(0)+"    "+this.inputPaths.get(1));
        }

        public void start() {
                createLinkingFile();
                Silk.executeFile(silkfile.getLocation(),linkID,1,true);
                this.sourceDatasetModel = SPARQLUtils.readRdfFile(this.sourceDataset.getFile());
                this.targetDatasetModel = SPARQLUtils.readRdfFile(this.targetDataset.getFile());
                //this.getLinkingResultsOverview();
        }


        
        
        private JSONArray getOutput(Model outputModel){
                
                Model globalModel = this.sourceDatasetModel.union(this.targetDatasetModel).union(outputModel);
                
                String sourceVar = this.getSourceVariable();
                String targetVar = this.getTargetVariable();
                String confidence = "confidence";
                JSONArray sourceInputPaths = this.getSourceInputPaths();
                JSONArray targetInputPaths = this.getTargetInputPaths();
                
                String queryString = "";
                String prefixesPartOfQuery = SPARQLUtils.getPrefixesForSPARQLQuery(this.prefixesMap);
                
                StringBuilder selectClause = new StringBuilder();
                selectClause.append("?" + sourceVar + " ");
                selectClause.append("?" + targetVar + " ");
                selectClause.append("?" + confidence + " ");
                
                StringBuilder whereClause = new StringBuilder();
                whereClause.append("?link <http://knowledgeweb.semanticweb.org/heterogeneity/alignment#entity1> " + "?" + sourceVar + ".");
                whereClause.append("?link <http://knowledgeweb.semanticweb.org/heterogeneity/alignment#entity2> " + "?" + targetVar + ".");
                whereClause.append("?link <http://knowledgeweb.semanticweb.org/heterogeneity/alignment#measure> " + "?" + confidence + ".");
                
          
                for(int i = 0; i < sourceInputPaths.length();i++){
                        
                        selectClause.append("?spv" + i + " ");
                        selectClause.append("?tpv" + i + " ");
                        
                        try {
                                whereClause.append("?" + sourceVar + " " + sourceInputPaths.getString(i).substring(sourceVar.length()+2) + " " + "?spv" + i + ".");
                                whereClause.append("?" + targetVar + " " + targetInputPaths.getString(i).substring(targetVar.length()+2) + " " + "?tpv" + i + ".");
                                i++;
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                        
                }
                
                queryString+=(prefixesPartOfQuery + "SELECT " + selectClause.toString() + "WHERE { " + whereClause.toString() + "}");
                
                queryString+=("ORDER BY DESC(?"+confidence+")");
                
                System.out.println(queryString);
                Query query = QueryFactory.create(queryString) ;
                QueryExecution qexec = QueryExecutionFactory.create(query,globalModel) ;
                JSONArray resultsJSON = new JSONArray();
                JSONArray inputPaths;
                JSONObject solution_o;
                JSONObject inputPath_o;
                try {
                        ResultSet results = qexec.execSelect() ;
                        
                        for ( ; results.hasNext() ; )
                        {
                                QuerySolution soln = results.nextSolution();
                                solution_o = new JSONObject();
                                solution_o.put("source",soln.get(sourceVar).toString());
                                solution_o.put("target",soln.get(targetVar).toString());
                                solution_o.put("confidence",this.getConfidence(soln.get(confidence).toString()));
                                inputPaths = new JSONArray();
                                for(int k = 0; k < sourceInputPaths.length();k++){
                                        inputPath_o = new JSONObject();
                                        inputPath_o.put("sip",sourceInputPaths.get(k));
                                        inputPath_o.put("tip",targetInputPaths.get(k));
                                        inputPath_o.put("sipv",soln.get("spv"+k));
                                        inputPath_o.put("tipv",soln.get("tpv"+k));
                                        inputPaths.put(inputPath_o);
                                }
                                solution_o.put("inputPaths",inputPaths);
                                resultsJSON.put(solution_o);
                        }
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }finally{
                        qexec.close();
                        System.out.println("finally "+resultsJSON.toString());
                }
                return resultsJSON;
        }
            
        

        private String getConfidence(String confidenceFromXMLFile) {
                int pos = confidenceFromXMLFile.indexOf("Some");
                String subtring1 = "";
                if(pos > 0){
                        subtring1 = confidenceFromXMLFile.substring(pos);
                        int pos1 = subtring1.indexOf(')');
                        subtring1 = subtring1.substring("Some(".length(),pos1);
                }
                return subtring1;
        }

        private boolean pathContainsVariable(String path, String var){
                
                int firstSlashPos = path.indexOf('/');
                String variable = path.substring(1,firstSlashPos);
                if(variable.equals(var)){
                        return true;
                }
                return false;
        }
        
       
        public JSONArray getAcceptedOutputLinks() {
                
                /*for (int i = 0; i < 100; i++) {
                        JSONObject link = new JSONObject();
                        try {
                                link.put("Source","<http://localhost:8080/data/rowID/1364>");
                                link.put("Target","<http://localhost:8080/data/rowID/1364>");
                                link.put("Confidence",i+"%");
                                links.put(link);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                return links;*/
                //SilkOutputParser parser = new SilkOutputParser(Paths.get(this.xmlAcceptedLinksFileLocation).toFile());
                //acceptedLinks = parser.getOutputLinks();
                Model acceptedLinksModel = SPARQLUtils.readRdfFile(this.xmlAcceptedLinksFileLocation);
                return this.getOutput(acceptedLinksModel);
        }
        
        public JSONArray getOutputLinksToVerify() {
                
                //SilkOutputParser parser = new SilkOutputParser(Paths.get(this.xmlVerifyLinksFileLocation).toFile());
                //JSONArray links = parser.getOutputLinks();
                Model verifyLinksModel = SPARQLUtils.readRdfFile(this.xmlVerifyLinksFileLocation);
                return this.getOutput(verifyLinksModel);
        }
        
        public void addVerifiedLinksToAccepted(JSONArray links){
                for(int i = 0; i < links.length(); i++){
                        try {
                                this.acceptedLinks.put(links.getJSONObject(i));
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
        }
        
        public Dataset getSourceDataset() {
                
                return this.sourceDataset;
        }

        public Dataset getTargetDataset() {
                
                return this.targetDataset;
        }

        public String getAcceptedLinksFile() {
                
                return this.acceptedLinksFileLocation;
        }

        public String getSourceRestriction() throws JSONException {
               
                return userInput.getString("sourceRestrictTo");
        }

        public JSONArray getSourceInputPaths() {
                JSONArray paths = new JSONArray();
                for(int i = 0; i < this.inputPaths.size();i++){
                        System.out.println("i = "+i+" /input path ="+this.inputPaths.get(i));
                        if(this.pathContainsVariable(this.inputPaths.get(i), this.getSourceVariable())){
                                paths.put(this.inputPaths.get(i));  
                        }
                }
                return paths;
        }
        
        
        public JSONArray getTargetInputPaths() {
                JSONArray paths = new JSONArray();
                for(int i = 0; i < this.inputPaths.size();i++){
                        System.out.println("i = "+i+" /input path ="+this.inputPaths.get(i));
                        if(this.pathContainsVariable(this.inputPaths.get(i), this.getTargetVariable())){
                                paths.put(this.inputPaths.get(i));  
                        }
                }
                return paths;
        }


        public String getSourceVariable(){
                String sourceVar = "";
                try {
                        sourceVar = this.userInput.getString("sourceVar");
                } catch (JSONException e) {
                        e.printStackTrace();
                }  
                return sourceVar;
        }
        
        public String getTargetVariable(){
                String targetVar = "";
                try {
                        targetVar = this.userInput.getString("targetVar");
                } catch (JSONException e) {
                        e.printStackTrace();
                }
                return targetVar;
        }
        
        
        public String getTargetRestriction() throws JSONException {
                return userInput.getString("targetRestrictTo");
        }

 /*private JSONArray getLinkingResultsOverview(String outputLinksModel){
        
        JSONArray resultsJSON = new JSONArray();
        try {
                String sourceVar = this.userInput.getString("sourceVar");
                String targetVar = this.userInput.getString("targetVar");
                ArrayList<String> sourceInputPaths = new ArrayList<String>();
                ArrayList<String> targetInputPaths = new ArrayList<String>();
                
                for(int i = 0; i < this.inputPaths.size();i++){
                        System.out.println("i = "+i+" /input path ="+this.inputPaths.get(i));
                        if(this.pathContainsVariable(this.inputPaths.get(i), sourceVar)){
                                sourceInputPaths.add(this.inputPaths.get(i));  
                        }else{  
                                targetInputPaths.add(this.inputPaths.get(i));
                        }
                }

                Model linksModel = SPARQLUtils.readRdfFile(Paths.get(outputLinksModel).toFile());
                
                Model enrichedModel = linksModel.union(this.sourceDatasetModel);
                
                
                
                Query query = QueryFactory.create("SELECT ?l ?entity1 ?entity2 ?conf WHERE {?l <http://knowledgeweb.semanticweb.org/heterogeneity/alignment#entity1> ?entity1."+
                                                                                        "?l <http://knowledgeweb.semanticweb.org/heterogeneity/alignment#entity2> ?entity2." +
                                                                                        "?l <http://knowledgeweb.semanticweb.org/heterogeneity/alignment#measure> ?conf.}") ;
                QueryExecution qexec = QueryExecutionFactory.create(query,linksModel) ;
                
                
                JSONArray inputPaths;
                JSONObject solution_o;
                JSONObject inputPath_o;
                try {
                        ResultSet results = qexec.execSelect() ;
                        
                        for ( ; results.hasNext() ; )
                        {
                                QuerySolution soln = results.nextSolution();
                                System.out.println(soln.toString());
                        }
                }finally{
                        qexec.close();
                }
                                
                
                //ResIterator sourceEntities = linksModel.listSubjects();
                //NodeIterator targetEntities = linksModel.listObjects();
                
                String sourcePath = "";
                String targetPath = "";
                for(int i = 0;i < sourceInputPaths.size();i++){
                        sourcePath = sourceInputPaths.get(i);
                        System.out.println(" i = "+i +"/sourcePath = "+sourcePath);
                        targetPath = targetInputPaths.get(i);
                        sourcePath = sourcePath.substring(sourcePath.indexOf('/')+1);
                        System.out.println("output model before "+linksModel.size());
                        //linksModel = this.extendOutputModel(this.sourceDatasetModel,sourceEntities,sourceVar,sourcePath,i,linksModel);
                        targetPath = targetPath.substring(targetPath.indexOf('/')+1);
                        //linksModel = this.extendOutputModel(this.targetDatasetModel,targetEntities,targetVar,targetPath,i,linksModel);
                }
                
                System.out.println("output model after "+linksModel.size());
                
                resultsJSON =  this.queryOutput(linksModel,sourceInputPaths.size());
                
        } catch (JSONException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
        }
        return resultsJSON;
}*/
       /* private JSONArray queryOutput(Model acceptedLinksModel,int numberOfInputPaths) {
                
                String queryString = "";
                String prefixesPartOfQuery = SPARQLUtils.getPrefixesForSPARQLQuery(this.prefixesMap);
                String mainPart = "SELECT ?s ?spv ?sp ?t ?tpv ?tp WHERE {"+
                                 "?s owl:sameAs ?t."+
                                 "?s <http://localhost:8080/silk/hasValueOfInputPath0> ?spv.?s <http://localhost:8080/silk/hasInputPath0> ?sp."+
                                 "?t <http://localhost:8080/silk/hasValueOfInputPath0> ?tpv.?t <http://localhost:8080/silk/hasInputPath0> ?tp}";
                
                StringBuilder selectClause = new StringBuilder();
                selectClause.append("?s ?t ");
                int i = 0;
                numberOfInputPaths--;
                while(i <= numberOfInputPaths){
                        selectClause.append("?spv" + i + " " + "?sp" + i + " ");
                        selectClause.append("?tpv" + i + " " + "?tp" + i + " ");
                        i++;
                }
                
                StringBuilder whereClause = new StringBuilder();
                whereClause.append("?s owl:sameAs ?t.");
                
                
                
                String valueOfInputPathProperty = "http://localhost:8080/silk/hasValueOfInputPath";
                String hasInputPathProperty = "http://localhost:8080/silk/hasInputPath";
                i = 0;
                while(i <= numberOfInputPaths){
                        valueOfInputPathProperty+=i;
                        hasInputPathProperty+=i;
                        whereClause.append("?s" + " " + "<" + valueOfInputPathProperty + ">" + " " + "?spv" + i + ".\n");
                        whereClause.append("?s" + " " + "<" + hasInputPathProperty + ">" + " " + "?sp" + i + ".\n");
                        whereClause.append("?t" + " " + "<" + valueOfInputPathProperty + ">" + " " + "?tpv" + i + ".\n");
                        whereClause.append("?t" + " " + "<" + hasInputPathProperty + ">" + " " + "?tp" + i + ".\n");
                        i++;
                }
                
                //String mainPart = "SELECT * WHERE {?s ?p ?o}";
                queryString+=(prefixesPartOfQuery + "SELECT " + selectClause.toString() + "WHERE { " + whereClause.toString() + "}");
                System.out.println(queryString);
                Query query = QueryFactory.create(queryString) ;
                QueryExecution qexec = QueryExecutionFactory.create(query,acceptedLinksModel) ;
                
                JSONArray resultsJSON = new JSONArray();
                JSONArray inputPaths;
                JSONObject solution_o;
                JSONObject inputPath_o;
                try {
                        ResultSet results = qexec.execSelect() ;
                        
                        for ( ; results.hasNext() ; )
                        {
                                QuerySolution soln = results.nextSolution();
                                solution_o = new JSONObject();
                                try {
                                        solution_o.put("s",soln.get("s").toString());
                                        solution_o.put("t",soln.get("t").toString());
                                        inputPaths = new JSONArray();
                                        for(int k = 0; k < numberOfInputPaths;k++){
                                                inputPath_o = new JSONObject();
                                                inputPath_o.put("sp",soln.get("sp"+k));
                                                inputPath_o.put("spv",soln.get("spv"+k));
                                                inputPath_o.put("tp",soln.get("tp"+k));
                                                inputPath_o.put("tpv",soln.get("tpv"+k));
                                                inputPaths.put(inputPath_o);
                                        }
                                        solution_o.put("inputPaths",inputPaths);
                                } catch (JSONException e) {
                                        // TODO Auto-generated catch block
                                        e.printStackTrace();
                                }
                                
                                
                                System.out.println(soln.toString());
                        }
                        
                        //resultsJSON  = SPARQLUtils.getSPARQLQueryResultsInJSON(results);
                } finally { 
                        qexec.close() ;      
                }
                return resultsJSON;
        }
        
        
        
        
        
        

        private Model extendOutputModel(Model inputModel,ResIterator entities, String sourceVar, String sourceProperyPath,int counter,Model outputModel) {
                
                String queryString;
                String prefixesPartOfQuery = SPARQLUtils.getPrefixesForSPARQLQuery(this.prefixesMap);
                String mainPart;
                System.out.println(prefixesPartOfQuery);
                Resource entityResource;
                String internalVariable = "?o";
                List<Statement> statementsList = new ArrayList<Statement>();
                
                boolean printQuery = true;
                while(entities.hasNext()){
                        //statementsList.clear();
                        queryString = "";
                        mainPart = "";
                        entityResource = entities.next();
                        System.out.println(entityResource.toString());
                        mainPart = "SELECT " +internalVariable+ " WHERE {" + "<"+ entityResource.toString() + ">" + " " 
                                   + sourceProperyPath + " " + internalVariable + "}";
                        queryString+=(prefixesPartOfQuery+mainPart);
                        
                        if(printQuery){
                                System.out.println(queryString);
                                printQuery = false;
                        }
                        
                        Query query = QueryFactory.create(queryString) ;
                        QueryExecution qexec = QueryExecutionFactory.create(query,inputModel) ;
                        Property valueOfInputPath = inputModel.createProperty("http://localhost:8080/silk/","hasValueOfInputPath"+counter);
                        Property hasInputPath = inputModel.createProperty("http://localhost:8080/silk/","hasInputPath"+counter);
                        try {
                                ResultSet results = qexec.execSelect() ;
                                for ( ; results.hasNext() ; )
                                {
                                        QuerySolution soln = results.nextSolution();
                                        Statement statement = outputModel.createStatement(entityResource,valueOfInputPath,soln.get(internalVariable));
                                        System.out.println(sourceVar+sourceProperyPath.toString());
                                        Statement statement1 = outputModel.createStatement(entityResource,hasInputPath,"?"+sourceVar+"/"+sourceProperyPath.toString());
                                        statementsList.add(statement);
                                        statementsList.add(statement1);
                                        System.out.println(soln.toString());
                                }
                                //resultsJSON = SPARQLUtils.getSPARQLQueryResultsInJSON(results);
                        } finally { 
                                qexec.close() ; 
                                
                        }
                }
                outputModel.add(statementsList);
                return outputModel;
        }

        private Model extendOutputModel(Model inputModel,NodeIterator entities, String sourceVar, String sourceProperyPath,int counter,Model outputModel) {
                
                String queryString;
                String prefixesPartOfQuery = SPARQLUtils.getPrefixesForSPARQLQuery(this.prefixesMap);
                String mainPart;
                System.out.println(prefixesPartOfQuery);
                RDFNode node;
                String internalVariable = "?o";
                List<Statement> statementsList = new ArrayList<Statement>();
                
                boolean printQuery = true;
                while(entities.hasNext()){
                        //statementsList.clear();
                        queryString = "";
                        mainPart = "";
                        node = entities.next();
                        System.out.println(node.toString());
                        mainPart = "SELECT " +internalVariable+ " WHERE {" + "<"+ node.toString() + ">" + " " 
                                   + sourceProperyPath + " " + internalVariable + "}";
                        queryString+=(prefixesPartOfQuery+mainPart);
                        
                        if(printQuery){
                                System.out.println(queryString);
                                printQuery = false;
                        }
                        Query query = QueryFactory.create(queryString) ;
                        QueryExecution qexec = QueryExecutionFactory.create(query,inputModel) ;
                        Property valueOfInputPath = inputModel.createProperty("http://localhost:8080/silk/","hasValueOfInputPath"+counter);
                        Property hasInputPath = inputModel.createProperty("http://localhost:8080/silk/","hasInputPath"+counter);
                        try {
                                ResultSet results = qexec.execSelect() ;
                                for ( ; results.hasNext() ; )
                                {
                                        QuerySolution soln = results.nextSolution();
                                        Statement statement = outputModel.createStatement((Resource) node,valueOfInputPath,soln.get(internalVariable));
                                        Statement statement1 = outputModel.createStatement((Resource) node,hasInputPath,"?"+sourceVar+"/"+sourceProperyPath.toString());
                                        statementsList.add(statement);
                                        statementsList.add(statement1);
                                        System.out.println(soln.toString());
                                }
                                //resultsJSON = SPARQLUtils.getSPARQLQueryResultsInJSON(results);
                        } finally { 
                                qexec.close() ; 
                                
                        }
                }
                outputModel.add(statementsList);
                return outputModel;
        }*/
        
        
        
        
        
        
        
}
