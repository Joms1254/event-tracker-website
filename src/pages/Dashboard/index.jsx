import React, { useState, useEffect } from "react";
import DashboardLayout from "./../Layout";
import { IoIosCloseCircle } from "react-icons/io";
import { FaRegTrashAlt, FaEye } from "react-icons/fa";
import { MdEditSquare } from "react-icons/md";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showhide, setShowhide] = useState(false);
  const [name, setName] = useState("");
  const [artists, setArtists] = useState([]);
  const [edit, setEdit] = useState("");

  useEffect(() => {
    const check_login = localStorage.getItem("token");
    if (!check_login) {
      toast.error("Please login first");
      navigate("/");
    }

    // Fetch artists from API
    axios.get("http://localhost:5000/artists")
      .then(response => {
        setArtists(response.data);
      })
      .catch(error => {
        toast.error("Error fetching artists");
      });
  }, []);

  const do_save_artist = async (e) => {
    e.preventDefault();

    if (name === "") {
      toast.error("Please enter artist name");
      return;
    }

    const artistData = { name };

    if (edit === "") {
      // Create a new artist
      axios.post("http://localhost:5000/artists", artistData)
        .then(response => {
          setArtists(prevArtists => [...prevArtists, { id: response.data.artistId, name }]);
          toast.success("Artist added successfully");
        })
        .catch(error => {
          toast.error("Error adding artist");
        });
    } else {
      // Update an existing artist
      axios.put(`http://localhost:5000/artists/${artists[edit].id}`, artistData)
        .then(response => {
          const updatedArtists = [...artists];
          updatedArtists[edit].name = name;
          setArtists(updatedArtists);
          toast.success("Artist updated successfully");
        })
        .catch(error => {
          toast.error("Error updating artist");
        });
    }
    setName("");
    setEdit("");
    setShowhide(false);
  };

  const EditPopup = (ind, name) => {
    setEdit(ind);
    setName(name);
    setShowhide(true);
  };

  const delete_artist = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/artists/${id}`)
          .then(response => {
            setArtists(artists.filter(artist => artist.id !== id));
            Swal.fire("Deleted!", "The artist has been deleted.", "success");
          })
          .catch(error => {
            Swal.fire("Error!", "There was an error deleting the artist.", "error");
          });
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-800 text-md font-bold uppercase">Artists</div>
        <button
          onClick={() => setShowhide(!showhide)}
          type="button"
          className="px-5 py-3.5 rounded-full text-white text-xs tracking-wider border border-current outline-none hover:bg-[#202020] bg-[#56AEFB]"
        >
          Add New Artist
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border-1 border-[#ccc]">
          <thead className="whitespace-nowrap">
            <tr>
              <th className="pl-4 w-8 bg-[#f0f0f0]"></th>
              <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">
                Artist name
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0] w-[150px]">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="whitespace-nowrap">
            {artists.length === 0 && (
              <tr className="hover:bg-gray-10 text-center">
                <td colSpan={3} className="p-4 text-sm text-[#ff6767]">
                  No Artist found!
                </td>
              </tr>
            )}
            {artists.map((artist, index) => (
              <tr className="hover:bg-gray-100 even:bg-[#f0f0f0]">
                <td className="pl-4 w-[60px] text-sm">{index + 1}</td>
                <td className="p-4 text-sm text-gray-800">{artist.name}</td>
                <td className="p-4 text-sm text-gray-800">
                  <span className="flex items-center gap-3">
                    <FaEye size={20} color="#444" className="cursor-pointer" onClick={() => navigate(`/artist/${artist.id}`)} />
                    <MdEditSquare size={20} color="#444" className="cursor-pointer" onClick={() => EditPopup(index, artist.name)} />
                    <FaRegTrashAlt size={18} color="#ff6767" className="cursor-pointer" onClick={() => { delete_artist(artist.id); }} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showhide && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[10] bg-[#00000060] backdrop-blur-[5px] h-screen w-full popup_outer">
          <div className="flex justify-center items-center h-full w-full">
            <div className="bg-white p-8 rounded-[20px] backdrop-blur-[50px] w-[90%] md:w-[40%] text-[#454545] relative">
              <div
                className="absolute right-[10px] top-[10px] close_icon cursor-pointer"
                onClick={() => { setShowhide(false); setEdit(""); setName(""); }}
              >
                <IoIosCloseCircle size={26} color="#ff6767" />
              </div>
              <h4 className="text-xl font-bold uppercase mb-1 text-center">
                {edit === "" ? "Add" : "Edit"} artist
              </h4>
              <form className="mt-6" onSubmit={(e) => do_save_artist(e)}>
                <div className="form-group mb-4">
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    placeholder="Enter artist name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <button type="submit" className="button_main w-full text-white">
                    {edit === "" ? "Save" : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
