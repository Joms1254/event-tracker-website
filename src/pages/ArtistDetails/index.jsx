import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "./../Layout";
import { IoIosCloseCircle } from "react-icons/io";
import { FaRegTrashAlt, FaEye } from "react-icons/fa";
import { MdEditSquare } from "react-icons/md";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import ReactApexChart from 'react-apexcharts'
import Papa from 'papaparse';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import axios from "axios";
import Swal from "sweetalert2";

const ArtistDetails = () => {
  const [email, setEmail] = useState('');
  const [balance, setBalance] = useState(0);
  const [startdate, setStartDate] = useState('');
  const [enddate, setEndDate] = useState('');
  const [name, setName] = useState('');
  const { artistId } = useParams();
  const uploadcsv = useRef(null);
  const downloadcsv = useRef(null);
  const navigate = useNavigate();
  const [showhide, setShowhide] = useState(false);
  const [artists, setArtists] = useState([]);
  const [tours, setTours] = useState([]);
  const [filterongoingtours, setFilterOngoingTours] = useState([]);
  const [historyTour, setHistoryTour] = useState([]);
  const [edit, setEdit] = useState("");
  const [filterUpcomingTours, setFilterUpcomingTours] = useState([]);
  const [tourname, setTourName] =  useState("")
  const [place, setPlace] = useState("")
  const [income, setIncome] = useState("")
  const [datetour, setDateTour] = useState("")


 
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0]; // YYYY-MM-DD format (removes time and timezone)
  };

  useEffect(() => {
    const fetchTours = async () => {
      try {
        console.log("Fetching all tours for artistId:", artistId);
        const response = await axios.get(`http://localhost:5000/tours/${artistId}`);
        const allTours = response.data;
        console.log("all tours", allTours);
        setTours(allTours); // Store all fetched tours
      } catch (error) {
        console.error("Error fetching tours:", error);
      }
    };

    fetchTours();
  }, [artistId]);

  
  useEffect(() => {
    if (tours.length === 0) return;
  
    // Log the artistId and tour.art_id to check their types
    console.log("Artist ID:", artistId, "Type:", typeof artistId);
    console.log("Tour art_id:", tours[0].art_id, "Type:", typeof tours[0].art_id); // Log the type of art_id
  
    // Filter the tours by artistId
    const filteredToursByArtist = tours.filter(tour => {
      console.log("Comparing:", typeof tour.art_id, tour.art_id, "with", typeof artistId, artistId);
      return String(tour.art_id) === String(artistId); // Convert artistId to string for comparison
    });
  
    console.log("Filtered tours by artist:", filteredToursByArtist);
  
    // Get today's date and format it as YYYY-MM-DD (UTC)
    const today = new Date();
    const todayFormatted = today.toISOString().split("T")[0]; // YYYY-MM-DD format
  
    // Helper function to format tour date as YYYY-MM-DD (removing time and time zone)
  
  
    // Filter tours by year (Upcoming, Ongoing, Historical)
    const upcomingTours = filteredToursByArtist.filter(tour => {
      const tourDateFormatted = (tour.date); // Format tour date as YYYY-MM-DD (in UTC)
      return tourDateFormatted > todayFormatted; // Upcoming tours (dates after today)
    });
  
    const ongoingTours = filteredToursByArtist.filter(tour => {
      const tourDateFormatted = (tour.date); // Format tour date as YYYY-MM-DD (in UTC)
      return tourDateFormatted === todayFormatted; // Ongoing tours (dates equal to today)
    });
  
    const historicalTours = filteredToursByArtist.filter(tour => {
      const tourDateFormatted = (tour.date); // Format tour date as YYYY-MM-DD (in UTC)
      return tourDateFormatted < todayFormatted; // Historical tours (dates before today)
    });
  
    // Update the states for filtered tours
    setFilterUpcomingTours(upcomingTours);
    setFilterOngoingTours(ongoingTours);
    setHistoryTour(historicalTours);
  
  }, [tours, artistId]);
  
  


  useEffect(() => {
    const formatDate = (date) => {
      const d = new Date(date);
      return d.toISOString().split("T")[0]; // Returns in YYYY-MM-DD format
    };
    if (artistId) {
      fetch(`http://localhost:5000/artists/${artistId}`) // Make sure this URL is correct
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Fetched data:", data);
          setEmail(data.email);
          setBalance(data.insurance_balance);
          setStartDate(formatDate(data.startdate));
          setEndDate(formatDate(data.enddate));
          setName(data.name);
        })
        .catch((err) => {
          console.error("Error fetching artist data:", err.message);
        });
    } else {
      console.error("No artistId found in URL.");
    }
  }, [artistId]);
  
  const do_save_artist = (e) => {
    e.preventDefault();
  
    // Prepare the data to be updated
    const artistData = {
      name,
      email,
      insurance_balance: balance,
      startdate,
      enddate,
    };
  
    // Send PUT request to the backend
    fetch(`http://localhost:5000/artists/${artistId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(artistData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Artist data updated successfully:", data);
  
        // Show a success toast with react-hot-toast
        toast.success("Artist data updated successfully!", {
          duration: 3000, // Duration of the toast (in milliseconds)
        });
      })
      .catch((err) => {
        console.error("Error updating artist data:", err.message);
  
        // Show an error toast with react-hot-toast
        toast.error("Error updating artist data!", {
          duration: 3000, // Duration of the toast (in milliseconds)
        });
      });
  };

  const addTour = async () => {
    if (!artistId || !tourname || !place || !income || !datetour) {
      toast.error("All fields are required.");
      return;
    }
  
    const newTour = {
      art_id: artistId,
      name: tourname,
      place: place,
      income: income,
      date: datetour,
    };
  
    try {
      const response = await fetch("http://localhost:5000/tours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTour),
      });      
  
      if (response.ok) {
        emailSubmit();
        const result = await response.json();
        console.log("Tour added successfully:", result);
        setTours((prevTours) => [
          ...prevTours,
          { ...newTour, id: result.tourId }, // Make sure to use the tourId from the result
        ]);
        toast.success("Tour information added successfully");
      } else {
        const errorText = await response.text();
        toast.error(`Error: ${errorText}`);
      }
    } catch (error) {
      console.error("Error adding tour:", error);
      toast.error("Failed to add tour");
    }
  };

  const updateTour = async () => {
    console.log(artistId);
    console.log("tours Edit", edit);
    const updatedTour = {
      id: edit,
      name: tourname,
      place: place,
      income: income,
      date: datetour,
    };
  
    try {
      const response = await fetch(`http://localhost:5000/tours/${edit}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTour),
      });
  
      const responseText = await response.text();  
      console.log("Response text:", responseText); 
  
 
      let result = {};
      if (responseText) {
        result = JSON.parse(responseText); 
      }
  
      if (response.ok) {
        const updatedTours = [...tours];
        updatedTours[edit] = { ...updatedTour };
        setTours(updatedTours);
        toast.success("Tour information updated successfully");

      } else {
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error updating tour:", error);
      toast.error("Failed to update tour");
    }
  };
  


  const do_save_tour = async (e) => {
    e.preventDefault();
  
    // Validation checks
    if (tourname === "") {
      toast.error("Please enter Tour name");
      return;
    }
    if (place === "") {
      toast.error("Please enter Place");
      return;
    }
    if (income === "") {
      toast.error("Please enter expected income");
      return;
    }
    if (datetour === "") {
      toast.error("Please enter Tour date");
      return;
    }
  
    try {
      if (edit === "") {
        await addTour(); // Ensure addTour completes
      } else {
        await updateTour(); // Ensure updateTour completes
       
      }
  
      // Clear form and UI
      setTourName("");
      setPlace("");
      setIncome("");
      setDateTour("");
      setShowhide(false);
  
      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error("Error saving/updating tour:", error);
      toast.error("An error occurred while saving/updating the tour.");

    }
  };


  


  const EditPopup = (ind, row) => {
    setEdit(ind);
    setTourName(row?.name);
    setPlace(row?.place)
    setIncome(row?.income)
    setDateTour(row?.date)
    setShowhide(true);
  };

  const deleteTour = (id) => {
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
        axios.delete(`http://localhost:5000/tours/${id}`)
          .then(response => {
            setTours(tours.filter(tour => tour.id !== id));
            Swal.fire("Deleted!", "The tour has been deleted.", "success").then(() => {
              window.location.reload(); // Reload the page after confirmation dialog
            });
          })
          .catch(error => {
            Swal.fire("Error!", "There was an error deleting the tour.", "error");
          });
      }
    });
  };
  

  const ApexChart = () => {
    const [chartData, setChartData] = useState({
      series: [{
        name: "Income",
        data: [],
      }],
      options: {
        chart: {
          height: 350,
          type: 'line',
          zoom: {
            enabled: false
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'straight'
        },
        title: {
          text: '',
          align: 'left'
        },
        grid: {
          row: {
            colors: ['#f3f3f3', 'transparent'],
            opacity: 0.5
          }
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          title: {
            text: 'Date',
            style: {
              color: '#333',
              fontSize: '14px',
              fontWeight: 'bold'
            }
          }
        },
        yaxis: {
          title: {
            text: 'Income',
            style: {
              color: '#333',
              fontSize: '14px',
              fontWeight: 'bold'
            }
          }
        }
      }
    });
  
    useEffect(() => {
      // Get the current date and current year
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
    
      // Filter data for dates less than today
      const filteredData = tours.filter(item => new Date(item.date) < currentDate);
    
      // Initialize an array to hold the sum of income by month
      const monthlyIncome = Array(12).fill(0); // 12 months, initialize to 0
    
      // Loop through the filtered data and sum the income for each month
      filteredData.forEach(item => {
        const itemDate = new Date(item.date);
        const itemYear = itemDate.getFullYear();
        const itemMonth = itemDate.getMonth(); // 0 = Jan, 1 = Feb, etc.
    
        // Only include items from the current year
        if (itemYear === currentYear) {
          // Ensure item.income is a number before adding
          const incomeAmount = Number(item.income);  // Convert to number
          monthlyIncome[itemMonth] += incomeAmount;  // Add income to the corresponding month
        }
      });
    
      // Update chart data state with the summed monthly income
      setChartData(prevData => ({
        ...prevData,
        series: [{
          name: "Income",
          data: monthlyIncome
        }]
      }));
    }, [tours]);
    
  
    return (
      <div>
        <div id="chart">
          <ReactApexChart options={chartData.options} series={chartData.series} type="line" height={350} />
        </div>
      </div>
    );
  };

  const handleButtonClick = () => {
    uploadcsv.current.click();
  };

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await axios.post(`http://localhost:5000/upload/${artistId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.status === 200) {
        toast.success("CSV uploaded successfully");
  
        // Option 1: Update state and reload manually
        setTours((prevTours) => [...prevTours, ...response.data.results.tours]);
        window.location.reload(); // Refresh the page to reflect changes
  
        // Option 2: Skip state update and directly reload
        // window.location.reload();
      } else {
        toast.error("Failed to upload CSV");
      }
    } catch (error) {
      console.error("Error uploading CSV:", error);
      toast.error("Error uploading CSV");
    }
  };


  const handleDownloadButton = () => {
    uploadcsv.current.click();
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/download/${artistId}`, {
        responseType: 'blob', 
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `artist_${artistId}_data.csv`;
  
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      if (error.response) {
        console.error('Error response:', error.response);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      alert('Failed to download CSV. Please try again later.');
    }
  };
  
     

  return (

    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-800 text-md font-bold uppercase">
          <span>Artist Detail</span>s
        </div>
      </div>

      <div className="flex justify-between gap-3">
        {/* FORM DETAILS */}
        <div className="box_white w-1/4 shadow-lg">
          <form onSubmit={do_save_artist}>
            <div className="mb-4 font-bold flex items-center gap-4">
              <img
                src={`https://ui-avatars.com/api/?name=${name}&background=random&color=ffffff`}
                className="rounded-full w-11 h-11"
              />
              {name}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-xs  mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow appearance-none border-[#f0f0f0] border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-xs  mb-2">
                Insurance balance ($)
              </label>
              <input
                type="number"
                required
                min={0}
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="shadow appearance-none border-[#f0f0f0] border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-xs  mb-2">
                Insurance Start Date
              </label>
              <input
              type="date"
              required
              value={startdate}
              onChange={(e) => setStartDate(e.target.value)}
              className="shadow appearance-none border-[#f0f0f0] border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
            />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-xs  mb-2">
                Insurance End Date
              </label>
              <input
              type="date"
              required
              value={enddate}
              onChange={(e) => setEndDate(e.target.value)}
              className="shadow appearance-none border-[#f0f0f0] border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
            />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[var(--button-color)] w-full mb-0 hover:bg-[#202020] text-white py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
              >
                Save changes
              </button>
            </div>
          </form>
        </div>

{/* TABLE DETAILS */}
        <div className="box_white w-3/4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-800 text-md font-bold uppercase">
              Tours
            </div>
            <div>
            <input
                    type="file"
                    ref={uploadcsv}
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={handleDownloadCSV} // Directly call handleDownloadCSV
                    className="px-5 py-2 rounded-full text-white text-xs tracking-wider border border-current outline-none hover:bg-[#202020] bg-[#56AEFB] mr-2"
                  >
                    Download CSV
                  </button>
                <input
                  type="file"
                  ref={downloadcsv} // This input seems unused, so we can remove it
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={handleButtonClick} // Call handleButtonClick to trigger file input
                  className="px-5 py-2 rounded-full text-white text-xs tracking-wider border border-current outline-none hover:bg-[#202020] bg-[#56AEFB] mr-2"
                >
                  Upload CSV
                </button>
              <button
                onClick={() => setShowhide(!showhide)}
                type="button"
                className="px-5 py-2 rounded-full text-white text-xs tracking-wider border border-current outline-none hover:bg-[#202020] bg-[#56AEFB]"
              >
                Add Tour
              </button>
            </div>
          </div>
{/* UPCOMING TOURS */}
<div className="bg-[#fff] p-4 rounded-lg">
  <div className="flex items-center justify-between mb-4">
    <div className="text-gray-800 text-sm font-bold uppercase">
      Upcoming Tours
    </div>
  </div>

  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border-1 border-[#ccc]">
      <thead className="whitespace-nowrap">
        <tr>
          <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">
            Tour Name
          </th>
          <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">
            Place
          </th>
          <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">
            Expected income
          </th>
          <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">
            Date
          </th>
          <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0] w-[150px]">
            Action
          </th>
        </tr>
      </thead>
      <tbody className="whitespace-nowrap">
        {/* Show message if no upcoming tours are found */}
        {filterUpcomingTours.length === 0 && (
              <tr className="hover:bg-gray-10 text-center">
                <td colSpan={5} className="p-4 text-sm text-[#ff6767]">
                  No Upcoming Tours found!
                </td>
              </tr>
            )}

        {/* Loop through filtered upcoming tours */}
        {filterUpcomingTours.map((tour) => (
              <tr key={tour.id} className="hover:bg-gray-100 even:bg-[#f0f0f0]">
                <td className="p-4 text-sm text-gray-800">{tour.name}</td>
                <td className="p-4 text-sm text-gray-800">{tour.place}</td>
                <td className="p-4 text-sm text-gray-800">${tour.income}</td>
                <td className="p-4 text-sm text-gray-800">{formatDate(tour.date)}</td>
                <td className="p-4 text-sm text-gray-800">
                  <span className="flex items-center gap-3">
                {/* View Tour Details */}
                <FaEye
                  size={20}
                  color="#444"
                  className="cursor-pointer"
                  onClick={() => navigate(`/tour/details/${tour.art_id}/${tour.id}`)}
                />

                {/* Edit Tour */}
                <MdEditSquare
                  size={20}
                  color="#444"
                  className="cursor-pointer"
                  onClick={() => EditPopup(tour.id, tour)}
                />

                {/* Delete Tour */}
                <FaRegTrashAlt
                  size={18}
                  color="#ff6767"
                  className="cursor-pointer"
                  onClick={() => {
                    deleteTour(tour.id);  // Make sure deleteTour is defined
                  }}
                />
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>


        {/* ONGOING TOURS */}
        <div className="bg-[#fff] p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-800 text-sm font-bold uppercase">
              Ongoing Tours
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-1 border-[#ccc]">
              <thead className="whitespace-nowrap">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">
                    Tour Name
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Place</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Expected income</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Date</th>
                </tr>
              </thead>
              <tbody className="whitespace-nowrap">
                {filterongoingtours.length === 0 && (
                  <tr className="hover:bg-gray-10 text-center">
                    <td colSpan={5} className="p-4 text-sm text-[#ff6767]">
                      No Tour(s) found!
                    </td>
                  </tr>
                )}
                {filterongoingtours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-gray-100 even:bg-[#f0f0f0]">
                    <td className="p-4 text-sm text-gray-800">
                      {tour.name}
                    </td>
                    <td className="p-4 text-sm text-gray-800">{tour.place}</td>
                    <td className="p-4 text-sm text-gray-800">${tour.income}</td>
                    <td className="p-4 text-sm text-gray-800">{formatDate(tour.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* HISTORY TOURS */}
        <div className="bg-[#fff] p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-800 text-sm font-bold uppercase">
              Tours History
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-1 border-[#ccc]">
              <thead className="whitespace-nowrap">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">
                    Tour Name
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Place</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Date</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Income</th>
                </tr>
              </thead>
              <tbody className="whitespace-nowrap">
                {historyTour.length === 0 && (
                  <tr className="hover:bg-gray-10 text-center">
                    <td colSpan={5} className="p-4 text-sm text-[#ff6767]">
                      No Tour(s) found!
                    </td>
                  </tr>
                )}
                {historyTour.map((tour) => (
                  <tr key={tour.id} className="hover:bg-gray-100 even:bg-[#f0f0f0]">
                    <td className="p-4 text-sm text-gray-800">
                      {tour.name}
                    </td>
                    <td className="p-4 text-sm text-gray-800">{tour.place}</td>
                    <td className="p-4 text-sm text-gray-800">{formatDate(tour.date)}</td>
                    <td className="p-4 text-sm text-gray-800">
                      <input
                        type="number"
                        name="income"
                        min={0}
                        step={0.01}
                        className="w-full border border-gray-300 rounded-md p-2"
                        value={tour.income || ""}
                        onChange={(e) => {
                          const updatedTours = tours.map((t) =>
                            t.id === tour.id
                              ? { ...t, income: parseFloat(e.target.value) || 0 }
                              : t
                          );
                          setTours(updatedTours);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>

      <div className="box_white w-full mb-4 shadow-lg mt-6">
      <ApexChart />
      </div>

      {showhide && (
        <div
          class="fixed top-0 left-0 right-0 bottom-0 z-[10] bg-[#00000060] backdrop-blur-[5px] h-screen w-full popup_outer"
          id="login_popup"
        >
          <div class="flex justify-center items-center h-full w-full">
            <div class="bg-white p-8 rounded-[20px] backdrop-blur-[50px] w-[90%] md:w-[40%] text-[#454545] relative">
              <div
                class="absolute right-[10px] top-[10px] close_icon cursor-pointer"
                onClick={() => {
                  setShowhide(false);
                  setBalance(""); setDateTour(""), setPlace(""), setTourName("")
                }}
              >
                <IoIosCloseCircle size={26} color="#ff6767" />
              </div>
              <h4 class="text-xl font-bold uppercase mb-1 text-center">
                {edit == "" ? "Add" : "Edit"} Tour
              </h4>


              {/* email form notification  */}
              <form class="mt-6" onSubmit={(e) => do_save_tour(e)}>
                <div class="form-group mb-4">
                  <input
                    type="text"
                    class="form-control"
                    id="name"
                    name="name"
                    placeholder="Tour name"
                    required
                    value={tourname}
                    onChange={(e) => setTourName(e.target.value)}
                  />
                </div>
                <div class="form-group mb-4">
                  <input
                    type="text"
                    class="form-control"
                    id="place"
                    name="place"
                    placeholder="Place"
                    required
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                  />
                </div>
                <div class="form-group mb-4">
                  <input
                    type="number"
                    min={0}
                    class="form-control"
                    id="income"
                    name="income"
                    placeholder="Expected income"
                    required
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                  />
                </div>
                <div class="form-group mb-4">
                  <input
                    type="date"
                    class="form-control"
                    id="date"
                    name="date"
                    placeholder="Date"
                    required
                    value={datetour}
                    onChange={(e) => setDateTour(e.target.value)}
                  />
                </div>
                <div class="form-group">
                  <button type="submit" class="button_main w-full text-white">
                    {edit == "" ? "Save" : "Update"}
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
export default ArtistDetails;
