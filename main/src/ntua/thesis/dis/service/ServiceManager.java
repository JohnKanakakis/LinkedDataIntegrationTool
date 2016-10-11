package ntua.thesis.dis.service;


import java.util.HashMap;
import java.util.Map;

import ntua.thesis.dis.commands.*;
import ntua.thesis.dis.commands.dataspace.DataspaceProjectCommand;
import ntua.thesis.dis.commands.dataspace.GetAllDataspaceProjectMetadataCommand;
import ntua.thesis.dis.commands.dataspace.GetDataspaceProjectMetadataCommand;
import ntua.thesis.dis.commands.dataspace.GetDataspaceVocabularyCommand;
import ntua.thesis.dis.commands.dataspace.GetNamedGraphsCommand;
import ntua.thesis.dis.commands.importing.*;
import ntua.thesis.dis.commands.linking.*;
import ntua.thesis.dis.commands.mapping.*;
import ntua.thesis.dis.commands.queries.*;
import ntua.thesis.dis.dataspace.DataspaceManager;
import ntua.thesis.dis.importing.SourcesManager;
import ntua.thesis.dis.linking.LinkingManager;
import ntua.thesis.dis.mapping.SchemaMappingManager;
import ntua.thesis.dis.query.QueryManager;


public class ServiceManager {

        /*private HashMap <String,Command> commands = new HashMap <String,Command>();*/
        public static ServiceManager instance = new ServiceManager();
        
        
        public SourcesManager sourcesManager;
        public SchemaMappingManager schemaMappingManager;
        private FileManager fileManager;
        public LinkingManager linkingManager;
        private DataspaceManager dataspaceManager;
        public QueryManager queryManager;
        //private ProvenanceManager provenanceManager;
        
        private ServiceManager(){
                fileManager = FileManager.getInstance();
                fileManager.init();
                dataspaceManager = DataspaceManager.getInstance(); 
               // prefixesManager = PrefixesManager.getInstance();
                PrefixesManager.init();
                //provenanceManager = new ProvenanceManager(dataspaceManager);
                
                sourcesManager = new SourcesManager(this);
                schemaMappingManager = new SchemaMappingManager(this);
                linkingManager = new LinkingManager(this);
                queryManager = new QueryManager(this);
                //initializeCommands();
        }
        
        
        public static ServiceManager getInstance(){
                return instance;
        }
        
        public DataspaceManager getDataspaceManager(){
                return dataspaceManager;
        }
        
        public FileManager getFileManager(){
                return fileManager;
        }
        
        public static void resetExternalManagers(){
                instance.reset();
        }
        
        
        
        private void reset() {
                // TODO Auto-generated method stub
                
                //dataspaceManager.reset();
                sourcesManager.reset();
                schemaMappingManager.reset();
                linkingManager.reset();
                queryManager.reset();
        }


        public HashMap<String,Command> initializeCommands(){
                
                HashMap<String,Command> commands = new HashMap<String,Command>();
                System.out.println("initialize commands . . .");
                
                commands.putAll(initializeGeneralCommands());
                commands.putAll(initializeDataspaceCommands());
                commands.putAll(initializeSourcePhaseCommands());
                commands.putAll(initializeSchemaMappingPhaseCommands());
                commands.putAll(initializeLinkingPhaseCommands());
                //initializeQualityPhaseCommands();
               // initializeFusionPhaseCommands();
                commands.putAll(initializeQueryPhaseCommands());
                
                return commands;
        }
 
       private HashMap<String,Command> initializeDataspaceCommands() {
               HashMap<String,Command> commands = new HashMap<String,Command>();
               commands.put("dataspace/get-all-basic-metadata", new GetAllDataspaceProjectMetadataCommand());
               commands.put("dataspace/get-basic-metadata", new GetDataspaceProjectMetadataCommand());
               commands.put("dataspace/", new DataspaceProjectCommand());
               commands.put("dataspace/get-named-graphs", new GetNamedGraphsCommand());
               commands.put("dataspace/get-vocabulary", new GetDataspaceVocabularyCommand()); 
               return commands;
       }


/* public Command getCommand(String name){
                
                Command com = commands.get(name);    
                return com;         
        }*/

        private HashMap<String,Command> initializeGeneralCommands() {
                HashMap<String,Command> commands = new HashMap<String,Command>();
                
                commands.put("general/get-prefixes", new PrefixesCommand());
                commands.put("general/get-dataset-metadata", new GetDatasetMetadataCommand());
                commands.put("general/get-linking-tasks-metadata", new GetLinkingTasksMetadataCommand());
                commands.put("general/add-prefixes", new PrefixesCommand());
                
                return commands;
        }
        
        
        private HashMap<String,Command> initializeQueryPhaseCommands() {
                
                HashMap<String,Command> commands = new HashMap<String,Command>();
                commands.put("queries/build-dataspace", new BuildDataspaceCommand()); 
                commands.put("queries/execute-query", new ExecuteSPARQLQueryCommand());
                commands.put("queries/stop-query-execution", new StopSPARQLQueryExecutionCommand());
                commands.put("queries/", new SPARQLQueryCommand());
                commands.put("queries/rename-query", new RenameSPARQLQueryCommand());
                commands.put("queries/get-dataspace-queries", new GetDataspaceQueriesCommand());
                commands.put("queries/save-dataspace-queries", new SaveDataspaceQueriesCommand());
                return commands;
        }

       /* private HashMap<String,Command> initializeFusionPhaseCommands() {
                // TODO Auto-generated method stub
                
        }

        private HashMap<String,Command> initializeQualityPhaseCommands() {
                // TODO Auto-generated method stub
                
        }*/

        private HashMap<String,Command> initializeLinkingPhaseCommands() {
                HashMap<String,Command> commands = new HashMap<String,Command>();
                commands.put("linking-data/get-functions", new GetLinkageRuleFunctionsCommand());
                commands.put("linking-data/get-recommended-linking-tasks", new GetRecommendedLinkingTasksCommand());
                commands.put("linking-data/get-links", new GetLinksCommand());
                commands.put("linking-data/start-linking-task", new StartLinkingTaskCommand()); 
                commands.put("linking-data/get-path-info", new GetPathInfoCommand());
                commands.put("linking-data/confirm-task", new SaveLinkingTaskCommand());
                return commands;
        }

        private HashMap<String,Command> initializeSchemaMappingPhaseCommands() {
                HashMap<String,Command> commands = new HashMap<String,Command>();
                commands.put("schema-mapping/get-external-vocabularies", new ExternalVocabularyCommand());
                commands.put("schema-mapping/add-external-vocabulary", new ExternalVocabularyCommand());
                
                commands.put("schema-mapping/get-dataset-vocabulary", new GetDatasetVocabularyCommand());
                commands.put("schema-mapping/start-mapping-task", new StartMappingTaskCommand());
                commands.put("schema-mapping/save-mapping-task", new SaveMappingTaskCommand());
                //commands.put("schema-mapping/query-dataset", new QueryDatasetCommand());
                
                commands.put("schema-mapping/get-undefined-namespaces", new GetUndefinedNamespacesCommand());
                return commands;
        }

        private HashMap<String,Command> initializeSourcePhaseCommands() {
                
                HashMap<String,Command> commands = new HashMap<String,Command>();
                commands.put("import/get-relational-metadata", new GetRelationalMetadataCommand());
                commands.put("import/relational-query", new ImportRelationalQueryCommand());
                commands.put("import/tabular-file", new ImportTabularFileCommand());
                commands.put("import/triples-file", new ImportTriplesFileCommand());
               /* commands.put("import/delete-source", new DeleteSourceCommand());*/
                commands.put("import/create-datasets", new CreateDatasetsCommand());
                commands.put("import/json-data", new ImportJSONDataCommand());
                commands.put("import/sparql-endpoint", new ImportSPARQLEndpointCommand());
                
                return commands;
        }
}
