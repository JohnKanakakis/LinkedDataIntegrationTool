package ntua.thesis.dis.commands.importing;

import java.io.IOException;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;

import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.importing.SourcesManager;
import ntua.thesis.dis.importing.source.DBConnectionSource;


public class GetRelationalMetadataCommand extends Command{

        /**
         * 
         */
        private static final long serialVersionUID = 1L;
        
       /* private SourcesManager sm;
        
        public GetRelationalMetadataCommand(SourcesManager sourcesManager) {
                // TODO Auto-generated constructor stub
                sm = sourcesManager;
        }*/


        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
               doGet(request,response);
            }

            /**
             * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
             */
        public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
            // TODO Auto-generated method stub
                
                SourcesManager sm = getSourcesManager();
                try {
                        
                        String url         = request.getParameter("URL");
                        String schema      = request.getParameter("schema");
                        String username    = request.getParameter("username");
                        String password    = request.getParameter("password");
                        
                        //String url = "jdbc:mysql://useastdb.ensembl.org:3306/";
                       // String schema = "ensembl";
                       // String username = "anonymous";
                       // String password = "";

                        DBConnectionSource dbc = new DBConnectionSource();
                        
                        dbc.setConnection(url,schema,username,password);
                        
                   
                        sm.addConnection(dbc);
                        
                        JSONArray metadataArray = dbc.getMetadata();
                        
                        response.setContentType("application/json");
                        response.getWriter().write(metadataArray.toString());
                        
                    } catch (JSONException e) {
                            // TODO Auto-generated catch block
                            System.out.println("wrong");
                            e.printStackTrace();
                    } catch (InstantiationException e) {
                            // TODO Auto-generated catch block
                            e.printStackTrace();
                    } catch (IllegalAccessException e) {
                            // TODO Auto-generated catch block
                            e.printStackTrace();
                    } catch (ClassNotFoundException e) {
                            // TODO Auto-generated catch block
                            e.printStackTrace();
                    } catch (SQLException e) {
                            e.printStackTrace();
                            response.sendError(400);
                            response.getWriter().write("An error occured in connection.Please try again.");
                    }
       }
}
