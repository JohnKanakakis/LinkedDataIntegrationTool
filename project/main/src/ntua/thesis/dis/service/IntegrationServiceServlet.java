package ntua.thesis.dis.service;

import java.io.IOException;
import java.util.HashMap;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/*import org.slf4j.Logger;
import org.slf4j.LoggerFactory;*/

import ntua.thesis.dis.commands.Command;


/**
 * Servlet implementation class IntegrationServiceServlet
 */
@WebServlet("/IntegrationServiceServlet/*")
public class IntegrationServiceServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
    
	private HashMap <String,Command> commands = new HashMap <String,Command>();
	static final Logger logger = LoggerFactory.getLogger("IntegrationServiceServlet"); 
	private long currentDataspaceId;
	/**
     * @see HttpServlet#HttpServlet()
     */
    public IntegrationServiceServlet() {
        //super();
        //System.out.println("service servlet just created!!!!");    
        ServiceManager serviceManager = ServiceManager.instance;
        commands = serviceManager.initializeCommands();
    }

    public void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
            
            //System.out.println("integration service servlet Service"); 
            
            String path1 = request.getPathInfo();        
            System.out.println(path1+"   context path is "+request.getContextPath());           
            String path = request.getPathInfo().substring("/command/".length());
            
            int slash1 = path.indexOf('/');
            if (slash1 >= 0) {
                int slash2 = path.indexOf('/', slash1 + 1);
                if (slash2 > 0) {
                    path = path.substring(0, slash2);
                }
            }
            logger.info("SERVICE > "+path);
            logger.info("METHOD > "+request.getMethod().toString());
            Command command = commands.get(path);
            command.init(this);
            if (request.getMethod().equals("GET")){
                    command.doGet(request,response);
            }else if(request.getMethod().equals("POST")){
                    command.doPost(request,response);
            }else if(request.getMethod().equals("PUT")){
                    command.doPut(request,response);
            }else if(request.getMethod().equals("DELETE")){
                    command.doDelete(request,response);
            }            
    }
    
    public void setCurrentDataspaceId(long newDataspaceId) {
           this.currentDataspaceId = newDataspaceId;
            
    }

    public long getCurrentDataspaceId() {
            // TODO Auto-generated method stub
            return this.currentDataspaceId;
    }
    
  /*  
	*//**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 *//*
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	        doPost(request,response);
	}

	
	
	*//**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 *//*
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
 
	        
	        
	        
	        System.out.println("integration service servlet doPost");      
	        String path1 = request.getPathInfo();        
	        System.out.println(path1+"   context path is "+request.getContextPath());	        
	        String path = request.getPathInfo().substring("/command/".length());
	        System.out.println(path);
            int slash1 = path.indexOf('/');
            if (slash1 >= 0) {
                int slash2 = path.indexOf('/', slash1 + 1);
                if (slash2 > 0) {
                    path = path.substring(0, slash2);
                }
            }
            System.out.println("path is "+path);
	        Command command = commands.get(path);
	        command.doPost(request,response);    
	}*/
	
	static public void redirect(HttpServletResponse response, String url) throws IOException {
	        response.sendRedirect(url);
	}

        
}


