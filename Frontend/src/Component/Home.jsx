import React, { useEffect, useState,useContext} from "react";
import { useForm } from "react-hook-form";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Cookies from "js-cookie";
import { UserContext } from "../context/user.context";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [collaboratorModalOpen, setCollaboratorModalOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [projectError, setProjectError] = useState(null);
  const [collaborator, setCollaborator] = useState([])
  const { user, setUser } = useContext(UserContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (error) {
      toast.error(error);
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    let username = Cookies.get("token");
    if(!username){
      navigate('/login');
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:3000/projects/all", {
        credentials: "include",
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      setProjects(data.allProjects);
    } catch (error) {
      setError(error.message);
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjectDetails = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:3000/projects/get-project/${projectId}`, {
        method:"GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch project details");
      }
      const data = await response.json();
      setCollaborator(data.project);
    } catch (error) {
      setError(error.message);
      console.error(error.message);
    }
  };

  const createProject = async (data) => {
    try {
      const response = await fetch("http://localhost:3000/projects/create", {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        setProjectError(error.message);
        setTimeout(() => setProjectError(null), 5000);
      } else {
        const res = await response.json();
        //setProjects(res.project);
        fetchProjects();
        setIsModalOpen(false);
        reset();
      }
    } catch (error) {
      setProjectError(error.message);
      setTimeout(() => setProjectError(null), 5000);
    }
  };

  const handleRemoveCollaborator = async (projectId, collaboratorName) => {
    try {
      const response = await fetch(
        `http://localhost:3000/projects/delete-user/${projectId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify( {collaboratorName} ),
        }
      );
      const id=await response.json();
      console.log(id.updatedProject);
      if (response.ok) {
        fetchProjectDetails(projectId);
        setProjects((prev) =>
          prev.map((project) =>
            project._id === projectId
              ? {
                  ...project,
                  users: project.users.filter(
                    (user) => user !== id.updatedProject
                  ),
                }
              : project
          )
        );
      }
    } catch (error) {
      console.error("Error removing collaborator:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/users/logout", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        Cookies.remove("username");
        Cookies.remove("token");
        navigate("/login");
      } else {
        const error = await response.json();
        console.error("Logout failed:", error.message);
      }
    } catch (error) {
      setError(error.message);
      console.error("Error during logout:", error.message);
    }
  };

  const onAddMemberSubmit = async (data) => {
    try {
      const { name } = data;
      data = { projectId: selectedProject._id, user: name };
      const response = await fetch(`http://localhost:3000/projects/add-user`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const updatedProject = await response.json();
        setProjects((prev) =>
          prev.map((project) =>
            project._id === updatedProject._id ? updatedProject : project
          )
        );
        setAddMemberModalOpen(false);
        reset();
        fetchProjects();
      }else{
        const res = await response.json();
        setError(res.message);
        
      }
    } catch (error) {
      setError(error.message);
      console.error("Error adding collaborator:", error.message);
    }
  };

  return (
    <div className="flex flex-col items-start">
      <ToastContainer />
      <button
        onClick={handleLogout}
        className="absolute top-5 right-5 flex items-center bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300"
      >
        Logout
        <ExitToAppIcon className="ml-2" />
      </button>
      {/* New Project Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md m-5 hover:bg-blue-600 transition duration-300"
      >
        New Project
        <AddIcon className="ml-2" />
      </button>

      {/* Project List */}
      <div className="w-full px-5 space-y-4">
        {projects.map((project) => (
          <div
            key={project._id}
            className="flex justify-between items-center w-full bg-white border border-gray-300 rounded-md p-4 hover:shadow-md transition duration-300"
          >
            <div
              className="flex-1 cursor-pointer"
              onClick={() => navigate(`/chat/${project._id}`)}
            >
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <p className="text-sm text-gray-600">
                Collaborators: {project.users.length }
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  fetchProjectDetails(project._id);
                  setSelectedProject(project);
                  setCollaboratorModalOpen(true);
                }}
                className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition"
              >
                <MoreVertIcon />
              </button>
              <button
                onClick={() => {
                  setSelectedProject(project);
                  setAddMemberModalOpen(true);
                }}
                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              >
                <AddIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Team Modal */}
      {collaboratorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">
              {selectedProject.name}
              <p className="text-sm text-gray-600">
                {selectedProject.project_id}
              </p>
            </h2>
            <ul className="space-y-2">
              {collaborator.map((user) => (
                <li
                  key={user}
                  className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-md"
                >
                  <span>{user}</span>
                  <button
                    onClick={() =>
                      handleRemoveCollaborator(selectedProject._id, user)
                    }
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setCollaboratorModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {addMemberModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Add Collaborator</h2>
            <form
              onSubmit={handleSubmit(onAddMemberSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Collaborator Name
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Username is required" })}
                  className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setAddMemberModalOpen(false);
                    reset();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for New Project */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleSubmit(createProject)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  {...register("projectName", {
                    required: "Project name is required",
                  })}
                  className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project name"
                  aria-invalid={errors.projectName ? "true" : "false"}
                />
                {errors.projectName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.projectName.message}
                  </p>
                )}
                {projectError && (
                  <p className="text-red-500 text-sm mt-1">{projectError}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    reset();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
