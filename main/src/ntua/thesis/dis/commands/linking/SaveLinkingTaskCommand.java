package ntua.thesis.dis.commands.linking;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.linking.LinkingManager;


public class SaveLinkingTaskCommand extends Command {

                /**
                 * 
                 */
                private static final long serialVersionUID = 1L;
                
                /*private LinkingManager linkManager;
                
                
                public SaveLinkingTaskCommand(LinkingManager linkingManager) {
                        linkManager = linkingManager;
                }*/
                
                public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                        
                        LinkingManager lm = getLinkingManager();
                        
                        String linkTaskName = request.getParameter("linkTaskName");
                        String acceptedLinks = request.getParameter("acceptedLinks");
                        
                        JSONArray acceptedLinksJSON;
                        JSONObject taskInfo = new JSONObject();
                        try {
                                acceptedLinksJSON = new JSONArray(acceptedLinks);
                                taskInfo = lm.confirmLinkingTask(linkTaskName,acceptedLinksJSON);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                        
                        respondJSON(response,taskInfo);
                       /* try {
                                
                                 
                             
                                sourceInfo.put("Task Name", info.getJSONObject("source").getString("linkTaskName"));
                                sourceInfo.put("Properties",new JSONObject().put("Related Dataset Name",
                                                                                   info.getJSONObject("source").getString("relatedDatasetName"))
                                                                              .put("Total generated links",
                                                                                   info.getJSONObject("source").getString("generatedLinks"))    
                                                                              );
                                targetInfo.put("Task Name", info.getJSONObject("target").getString("linkTaskName"));
                                targetInfo.put("Properties",new JSONObject().put("Related Dataset Name",
                                                                                   info.getJSONObject("target").getString("relatedDatasetName"))
                                                                              .put("Total generated links",
                                                                                   info.getJSONObject("target").getString("generatedLinks"))    
                                                                              );
                                
                                 * 
                                 * test procedure
                                sourceInfo.put("name", "testDataset2");
                                sourceInfo.put("Task Name", "TestTaskName");
                                sourceInfo.put("properties",new JSONObject().put("Related Dataset Name","testDataset3")
                                                                              .put("Total generated links",200)    
                                                                              );
                                targetInfo.put("name", "testDataset3");
                                targetInfo.put("Task Name", "TestTaskName");
                                targetInfo.put("properties",new JSONObject().put("Related Dataset Name","testDataset2")
                                                                              .put("Total generated links",200)    
                                                                              );
                                answerToUser.put("source",sourceInfo).put("target",targetInfo);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                        System.out.println(answerToUser.toString());
                        response.setContentType("application/json");
                        response.getWriter().write(answerToUser.toString());*/
                }
                
                public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                        doPost(request,response);
                }
}
