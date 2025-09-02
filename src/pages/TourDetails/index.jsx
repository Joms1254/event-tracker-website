import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "./../Layout";
import { IoIosCloseCircle } from "react-icons/io";
import { FaRegTrashAlt, FaEye } from "react-icons/fa";
import { MdEditSquare } from "react-icons/md";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import ReactApexChart from 'react-apexcharts'
import Papa from 'papaparse';
import { FaCircleCheck } from "react-icons/fa6";
import axios from "axios";
import { formatDate } from "date-fns";
import Swal from "sweetalert2";


const TourDetails = () => {
  const { artistId, tourId } = useParams();
  const uploadcsv = useRef(null);
  const navigate = useNavigate();
  const [showhide, setShowhide] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState("");
  const [startdate, setStartDate] = useState("");
  const [enddate, setEndDate] = useState("");
  const [artists, setArtists] = useState([]);
  const [realartist, setRealArtist] = useState([]);
  const [tours, setTours] = useState([]);
  const [filterupcomingtours, setFilterUpcomingTours] = useState([]);
  const [filterongoingtours, setFilterOngoingTours] = useState([]);
  const [historyTour, setHistoryTour] = useState([]);
  const [edit, setEdit] = useState("");
  const [pretour, setPreTours] =  useState([])

  const [showtab, setShowTab] = useState(1)

  const [statements, setStatements] = useState([])
  const [tasks, setTasks] = useState([])
  const [taxes, setTaxes] = useState([])
  const [contracts, setContracts] = useState([])
  const [statementname, setStatementName] =  useState("")
  const [statementlink, setStatementLink] = useState("")
  const [countrytax, setCountryTax] = useState("")
  const [datetax, setDateTax] = useState("")
  const [income, setIncome] = useState("")
  const [datetour, setDateTour] = useState("")
  const [payment, setPayment] = useState("")
  const [people, setPeople] = useState("")
  const [trip_country, setTripCountry] = useState("")
  const [people_oversea, setPeopleOversea] = useState("")
  const [trip_oversea, setTripOversea] = useState("")
  const [notes, setOtherNotes] = useState("")
  const [posttour, setPostTours] = useState("")
  const [requiredbalance, setRequiredBalance] = useState(0);

  const [liability, setLiability] = useState({"text": "Coverred by Current PLI Turnover policy?", notes: ""})
  const [insurance, setInsurance] = useState({"text": "Covered by current Travel Insurance period?", notes: ""})
  const [equipment, setEquipment] = useState({"text": "Covered by current Equipment Insurance period?", notes: ""})
  const [workcover, setWorkCover] = useState({"text": "Workcover in place for contractors? - NSW", notes: ""})

  useEffect(() => {
    const check_login = localStorage.getItem("token");
    if (!check_login) {
      toast.error("Please login first");
      navigate("/");
    }

    // Fetch artists from API
    console.log("Fetching all tours for artistId:", artistId);
    axios.get(`http://localhost:5000/artists/${artistId}`)
      .then(response => {
        console.log("Fetched artists odwadwa:", response.data);
        setArtists(response.data);
      })
      .catch(error => {
        toast.error("Error fetching artists");
      });
  }, []);

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };


  useEffect(() => {
    const fetchTours = async () => {
      console.log(artistId, tourId);
      if (!artistId || !tourId) {
        console.error("artistId or tourId is missing or invalid");
        return;
      }

      try {
        console.log("Fetching all tours for artistId:", artistId);
        const response = await axios.get(`http://localhost:5000/tours/${artistId}`);
        const allTours = response.data;

        if (allTours.length === 0) {
          toast.info("No tours found for this artist.");
          setTours([]);
        } else {
          // Filter tours by tourId
          const filteredTours = allTours.filter((tour) => tour.id === parseInt(tourId));
          if (filteredTours.length === 0) {
            toast.info("No tours found for this specific filter.");
          }
          setTours(filteredTours);
          console.log("Filtered tours:", filteredTours);
        }
      } catch (error) {
        if (error.response && error.response.data.message) {
          console.error(error.response.data.message);
          toast.error(error.response.data.message);
        } else {
          console.error("Error fetching tours:", error);
          toast.error("An error occurred while fetching tours.");
        }
      }
    };

    fetchTours();
  }, [artistId, tourId]);
  useEffect(() => {
    const storedArtistsaa = JSON.parse(localStorage.getItem(artistId)) || [];
    const artistIndex = storedArtistsaa.findIndex(
      (artist) => Number(artist.id) === Number(tourId)
    );
    if (artistIndex !== -1) {
      setArtists(storedArtistsaa[artistIndex]);
    }

    const artistdata = JSON.parse(localStorage.getItem("artists")) || [];
    const artistfindIndex = artistdata.findIndex(
      (artist) => Number(artist.id) === Number(artistId)
    );
    if (artistfindIndex !== -1) {
      // console.log("realartist", realartist);
      setRealArtist(artistdata[artistIndex]);
    }

    // STATEMENT JSON DATA
    const statementdata = JSON.parse(localStorage.getItem("statement_"+tourId)) || [];
    setStatements(statementdata);

    // TASKS JSON DATA
    const tasksdata = JSON.parse(localStorage.getItem("tasks_"+tourId)) || [];
    setTasks(tasksdata);

    // TAXES JSON DATA
    const taxesdata = JSON.parse(localStorage.getItem("tax_"+tourId)) || [];
    setTaxes(taxesdata);


  }, []);

  // MANAGE STATMENT DATA
  useEffect(() => {
    localStorage.setItem("statement_"+tourId, JSON.stringify(statements));
  }, [statements]);





  // MANAGE CONTRACTORS DATA
  useEffect(() => {
    localStorage.setItem("contract_"+tourId, JSON.stringify(contracts));
  }, [contracts]);



  useEffect(() => {
    // localStorage.setItem(slug, JSON.stringify(tours));
  }, [tours]);

  // ADD PRETOUR
  const do_save_statement = async (e) => {
    e.preventDefault();
  
    if (statementname === "") {
      toast.error("Please enter Statement");
      return;
    }
    if (statementlink === "") {
      toast.error("Please enter Statement Links");
      return;
    }
  
    try {
      // Create a new statement (no editing)
      const newStatement = {
        art_id: artistId,
        tour_id: tourId,
        statements: statementname,
        link: statementlink,
        status: "Unchecked", 
      };
      console.log("newStatement", newStatement);
  
      // Send request to backend to save the new statement
      const response = await axios.post('http://localhost:5000/pre_tour', newStatement);
      
      // Update the state with the new statement
      setStatements((prevStatements) => [...prevStatements, response.data]);
      
      // Clear input fields and close form
      setShowhide(false);
      setStatementName("");
      setStatementLink("");
      
      toast.success("Statement information added successfully");
  
      // Reload the page after success
      window.location.reload();
    } catch (error) {
      toast.error("An error occurred while saving the statement");
      console.error(error);
    }
  };
  
  
//GET PRE_TOUR
  useEffect(() => {
    const fetchPreTour = async () => {
      try {
        console.log("Fetching Pre-Tour for Artist:", artistId, "Tour:", tourId);
        const response = await axios.get(`http://localhost:5000/pre_tour/${artistId}/${tourId}`);
        const pre_tour = response.data;
        console.log("Fetched Pre-Tour Data:", pre_tour);
        setPreTours(pre_tour); 
      } catch (error) {
        console.error("Error fetching Pre-Tour:", error);
      }
    };
  
    fetchPreTour();
  }, [artistId, tourId]);
  
//CHANGE PRE_TOUR_CHECKBOX
const changeStatementStatus = async (e, id) => {
  console.log("Statements:", pretour);  // Log the statements array
  console.log("Changing status for Statement ID:", id);  // Log the ID being passed

  // First, update the status locally in the statements array
  const updatedStatements = pretour.map((statement) => {
    if (statement.id === id) {
      return { ...statement, status: e.target.checked ? "Checked" : "Unchecked" };
    }
    return statement;
  });

  // Find the updated statement from the updatedStatements array
  const updatedStatement = updatedStatements.find((stmt) => stmt.id === id);
  console.log("Updated statement:", updatedStatement);  // Log the updated statement

  // Check if the updatedStatement is found before proceeding
  if (!updatedStatement) {
    toast.error("Statement not found");
    return;
  }

  // Update the status in the backend
  try {
    const response = await axios.put(`http://localhost:5000/pre_tour/status/${id}`, { status: updatedStatement.status });

    // After successful update, update the state with the updated statements
    setStatements(updatedStatements);
    toast.success("Status information updated successfully!");

    // Reload the page after updating
    window.location.reload();
  } catch (error) {
    toast.error("Error updating status");
    console.error(error);
  }
};

  // TASKS NOTES TAB 5
  const do_save_tasks = async (e) => {
    e.preventDefault();
  
    // Validation checks for task information
    if (statementname === "") {
      toast.error("Please enter Task");
      return;
    }
    if (statementlink === "") {
      toast.error("Please enter Link");
      return;
    }
  
    try {
      // Create a new task (no editing)
      const newStatement = {
        art_id: artistId,
        tour_id: tourId,
        name: statementname,
        link: statementlink,
        status: "For Review", // Default status, assuming "0" means inactive or pending
      };
      console.log("newStatement", newStatement);
  
      // Send request to backend to save the new task
      const response = await axios.post('http://localhost:5000/post_tour', newStatement);
  
      // Update state with the new task
      setStatements((prevStatements) => [...prevStatements, response.data]);
  
      // Clear input fields and close form
      setShowhide(false);
      setStatementName("");
      setStatementLink("");
  
      toast.success("Task information added successfully");
  
      // Reload the page after success
      window.location.reload();
    } catch (error) {
      toast.error("An error occurred while saving the task");
      console.error(error);
    }
  };
  


//GET POST_TOUR
useEffect(() => {
  const fetchPostTour = async () => {
    try {
      console.log("Fetching post_tour for Artist:", artistId, "Tour:", tourId);
      const response = await axios.get(`http://localhost:5000/post_tour/${artistId}/${tourId}`);
      const post_tour = response.data;
      console.log("Fetched post_tour Data:", post_tour);
      setPostTours(post_tour); 
    } catch (error) {
      console.error("Error fetching post_tour:", error);
    }
  };

  fetchPostTour();
}, [artistId, tourId]);

   // TASKS TAX TAB 2
const changeTaxVariationStatus = (e, id) => {
  const updatedTaxes = taxes.map((tax) => {
    if (tax.id === id) {
      return { ...tax, status: e.target.value };
    }
    return tax;
  });
  
  // Update the tax status in state
  toast.success("Tax variation status updated successfully!");
  setTaxes(updatedTaxes);
};

// Tax Variation Statement Save
const do_save_tax_variation_statement = async (e) => {
  e.preventDefault();

  // Validation checks for tax variation statement
  if (statementname === "") {
    toast.error("Please enter Statement");
    return;
  }
  if (statementlink === "") {
    toast.error("Please enter Statement Links");
    return;
  }

  try {
    // Create a new tax variation statement (no editing)
    const newTaxVariationStatement = {
      art_id: artistId,
      tour_id: tourId,
      task_name: statementname,
      country: countrytax,
      task_link: statementlink,
      date: datetax,
      status: "For Review", // Default status, assuming "1" means active or completed
    };
    console.log("newTaxVariationStatement", newTaxVariationStatement);
    
    // Send request to backend to save the new statement
    const response = await axios.post('http://localhost:5000/tax_variation', newTaxVariationStatement);
    
    // Update state with the new tax variation statement
    setStatements((prevStatements) => [...prevStatements, response.data]);
    
    // Clear input fields and close form
    setShowhide(false);
    setStatementName("");
    setStatementLink("");
    
    toast.success("Tax variation statement added successfully");

    // Reload the page after success
    window.location.reload();
  } catch (error) {
    toast.error("An error occurred while saving the tax variation statement");
    console.error(error);
  }
};


// Fetches the tax variation
useEffect(() => {
  const fetchTaxVariation = async () => {
    try {
      console.log("Fetching Tax Variation for Artist:", artistId, "Tour:", tourId);
      const response = await axios.get(`http://localhost:5000/tax_variation/${artistId}/${tourId}`);
      const pretax = response.data;
      console.log("Fetched tax variation Data:", pretax);
      setTaxes(pretax); 
    } catch (error) {
      console.error("Error fetching tax variation:", error);
    }
  };

  fetchTaxVariation();
}, [artistId, tourId]);

//CHANGE Tax Status
const changeTaxStatus = async (e, id) => {
  console.log("Statements:", taxes);  // Log the statements array
  console.log("Changing status for Statement ID:", id);  // Log the ID being passed

  // Get the selected value from the dropdown
  const newStatus = e.target.value;

  // First, update the status locally in the statements array
  const updatedStatements = taxes.map((statement) => {
    if (statement.id === id) {
      return { ...statement, status: newStatus };  // Update the status with the selected value
    }
    return statement;
  });

  // Find the updated statement from the updatedStatements array
  const updatedStatement = updatedStatements.find((stmt) => stmt.id === id);
  console.log("Updated statement:", updatedStatement);  // Log the updated statement

  // Check if the updatedStatement is found before proceeding
  if (!updatedStatement) {
    toast.error("Statement not found");
    return;
  }

  // Update the status in the backend
  try {
    const response = await axios.put(`http://localhost:5000/tax_variation/status/${id}`, { status: newStatus });

    // After successful update, update the state with the updated statements
    setStatements(updatedStatements);
    toast.success("Status information updated successfully!");
  } catch (error) {
    toast.error("Error updating status");
    console.error(error);
  }
};

//CHANGE Tax Status
const changeTaskStatus = async (e, id) => {
  console.log("Statements:", posttour);  // Log the statements array
  console.log("Changing status for Statement ID:", id);  // Log the ID being passed

  // Get the selected value from the dropdown
  const newStatus = e.target.value;

  // First, update the status locally in the statements array
  const updatedStatements = posttour.map((statement) => {
    if (statement.id === id) {
      return { ...statement, status: newStatus };  // Update the status with the selected value
    }
    return statement;
  });

  // Find the updated statement from the updatedStatements array
  const updatedStatement = updatedStatements.find((stmt) => stmt.id === id);
  console.log("Updated statement:", updatedStatement);  // Log the updated statement

  // Check if the updatedStatement is found before proceeding
  if (!updatedStatement) {
    toast.error("Statement not found");
    return;
  }

  // Update the status in the backend
  try {
    const response = await axios.put(`http://localhost:5000/post_tour/status/${id}`, { status: newStatus });

    // After successful update, update the state with the updated statements
    setStatements(updatedStatements);
    toast.success("Status information updated successfully!");
  } catch (error) {
    toast.error("Error updating status");
    console.error(error);
  }
};

     // CONTARACTORS TAB 3
     const do_save_contracts = async (e) => {
      e.preventDefault();
    
      // Validation checks for contractor information
      if (payment === "") {
        toast.error("Please enter Payment");
        return;
      }
      if (people === "") {
        toast.error("Please enter People in country");
        return;
      }
      if (trip_country === "") {
        toast.error("Please enter Trip in country");
        return;
      }
      if (people_oversea === "") {
        toast.error("Please enter People Overseas");
        return;
      }
      if (trip_oversea === "") {
        toast.error("Please enter Trip Overseas");
        return;
      }
      if (notes === "") {
        toast.error("Please enter Other Notes");
        return;
      }
    
      try {
        // Create a new contractor (no editing)
        const newContractor = {
          art_id: artistId,
          tour_id: tourId,
          payment: payment,
          people: people,
          trip_country: trip_country,
          people_oversea: people_oversea,
          trip_oversea: trip_oversea,
          notes: notes
        };
        console.log("newContractor", newContractor);
    
        // Send request to backend to save the new contractor
        const response = await axios.post('http://localhost:5000/contractor', newContractor);
        
        // Update state with the new contractor
        setContracts((prevContractor) => [...prevContractor, response.data]);
        
        // Clear input fields and close form
        setShowhide(false);
        setPayment("");
        setPeople("");
        setTripCountry("");
        setPeopleOversea("");
        setTripOversea("");
        setOtherNotes("");
        
        toast.success("Contractor information added successfully");
    
        // Reload the page after success
        window.location.reload();
      } catch (error) {
        toast.error("An error occurred while saving the contractor");
        console.error(error);
      }
    };
    

    useEffect(() => {
      const fetchContractor = async () => {
        try {
          console.log("Fetching Contractors for Artist:", artistId, "Tour:", tourId);
          const response = await axios.get(`http://localhost:5000/contractor/${artistId}/${tourId}`);
          const contract = response.data;
          console.log("Fetched Contractors Data:", contract);
          setContracts(contract); 
        } catch (error) {
          console.error("Error fetching Contractors:", error);
        }
      };
    
      fetchContractor();
    }, [artistId, tourId]);

  const handle_required_balance = async (e) => {
    setRequiredBalance(e.target.value)
    localStorage.setItem(tourId+"_balance", e.target.value)
  }
  const change_insurance_data = (value, category, key) => {
    if(category == 'liability'){
      setLiability(prevState => ({
        ...prevState,
        [key]: value, 
      }));
      localStorage.setItem(tourId+"_"+category, JSON.stringify(liability))
    }
    if(category == 'insurance'){
      setInsurance(prevState => ({
        ...prevState,
        [key]: value, 
      }));
      localStorage.setItem(tourId+"_"+category, JSON.stringify(insurance))
    }

    if(category == 'equipment'){
      setEquipment(prevState => ({
        ...prevState,
        [key]: value, 
      }));
      localStorage.setItem(tourId+"_"+category, JSON.stringify(equipment))
    }

    if(category == 'cover'){
      setWorkCover(prevState => ({
        ...prevState,
        [key]: value, 
      }));
      localStorage.setItem(tourId+"_"+category, JSON.stringify(workcover))
    }

    
  };
  const saveInsurance = async () => {
      const notesPayload = {
        id: "0",
        required_balance: requiredbalance,
        liability_notes: liability.notes,
        insurance_notes: insurance ? insurance.notes : '',
        equipment_notes: equipment.notes,
        workcover_notes: workcover.notes,
      };
  
      let response;
      
      if (edit) {
        // Update existing insurance entry
        notesPayload.id = insurance.id;
        response = await axios.put(`http://localhost:5000/insurance/${insurance.id}`, notesPayload);
        if (response.status === 200) {
          toast.success("Insurance data updated successfully");
        } else {
          throw new Error("Error updating data");
        }
      } else {
        // Create new insurance entry
        response = await axios.post('http://localhost:5000/insurance', notesPayload);
        if (response.status === 200) {
          toast.success("Insurance data added successfully");
        } else {
          throw new Error("Error adding data");
        }
      }
  
      // Hide form and reset
      setShowhide(false);
  };
  
  

  //GET Insurance
  useEffect(() => {
    const fetchInsurance = async () => {
      try {
        console.log("Fetching insurance for Artist:", artistId, "Tour:", tourId);
        const response = await axios.get(`http://localhost:5000/insurance/${artistId}/${tourId}`);
        const insuranceData = response.data;
        console.log("Fetched insurance Data:", insuranceData);
  
        if (insuranceData && insuranceData.length > 0) {
          setInsurance({notes : insuranceData[0].insurance_notes}); // Assuming insurance is an array, set the first item
          setLiability({notes : insuranceData[0].liability_notes}); // Assuming liability is an array, set the first item
          setEquipment({notes : insuranceData[0].equipment_notes}); // Assuming equipment is an array, set the first item
          setWorkCover({notes : insuranceData[0].workcover_notes}); // Assuming workcover is an array, set the first item
          setRequiredBalance(insuranceData[0].required_balance); // Set the required_balance
          setEdit(true);  // If data exists, set edit mode
        } else {
          setInsurance(null);
          setRequiredBalance(0);  // Reset if no data
          setEdit(false);  // Stay in save mode if no data
        }
      } catch (error) {
        console.error("Error fetching insurance:", error);
      }
    };
  
    fetchInsurance();
  }, [artistId, tourId]);
  
  
  //DELETE PRETOUR
  const deletePreTour = (tour_id) => {
    console.log("Tour ID to delete:", tour_id);  // Log the tour_id passed into the function
  
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
        axios.delete(`http://localhost:5000/pre_tour/${tour_id}`)
          .then(response => {
            setTours(pretour.filter(pretour => pretour.id !== tour_id));  // Update state locally
            Swal.fire("Deleted!", "The artist has been deleted.", "success")
              .then(() => {
                // Reload the window after the Swal dialog finishes
                window.location.reload();
              });
          })
          .catch(error => {
            Swal.fire("Error!", "There was an error deleting the artist.", "error");
          });
      }
    });
  };

  //DELETE POST TOUR
  const deletePostTour = (tour_id) => {
    console.log("Tour ID to delete:", tour_id);  // Log the tour_id passed into the function
  
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
        axios.delete(`http://localhost:5000/post_tour/${tour_id}`)
          .then(response => {
            setTours(posttour.filter(posttour => posttour.id !== tour_id));  // Update state locally
            Swal.fire("Deleted!", "The Post has been deleted.", "success")
              .then(() => {
                // Reload the window after the Swal dialog finishes
                window.location.reload();
              });
          })
          .catch(error => {
            Swal.fire("Error!", "There was an error deleting the artist.", "error");
          });
      }
    });
  };
  const deleteTax = (tour_id) => {
    console.log("Tour ID to delete:", tour_id);  // Log the tour_id passed into the function
  
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
        axios.delete(`http://localhost:5000/tax_variation/${tour_id}`)
          .then(response => {
            setTours(pretour.filter(pretour => pretour.id !== tour_id));y
            Swal.fire("Deleted!", "The artist has been deleted.", "success")
              .then(() => {
                // Reload the window after the Swal dialog finishes
                window.location.reload();
              });
          })
          .catch(error => {
            Swal.fire("Error!", "There was an error deleting the artist.", "error");
          });
          window.location.reload();
      }
    });
  };

  // Update the tour
  const updatePreTour = (tour_id) => {
    const tour = pretour.find(t => t.id === tour_id);
    const { statements, link } = tour || { statements: "", link: "" };
  
    Swal.fire({
      title: "Pre-Tour Update",
      html: `
        <input type="text" id="statement" class="swal2-input" placeholder="Enter new statement" value="${statements}">
        <input type="url" id="link" class="swal2-input" placeholder="Enter new link" value="${link}">
      `,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Update",
      preConfirm: () => {
        const statement = Swal.getPopup().querySelector('#statement').value;
        const link = Swal.getPopup().querySelector('#link').value;
        
        // Check if statement and link are not empty
        if (!statement.trim() || !link.trim()) {
          Swal.showValidationMessage('Please enter both statement and link');
          return false;
        }
  
        // Check if link is a valid URL
        const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i; // Simple URL validation regex
        if (!urlPattern.test(link)) {
          Swal.showValidationMessage('Please enter a valid URL');
          return false;
        }
  
        return { statement, link };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedStatementData = {
          statements: result.value.statement.trim(),
          link: result.value.link.trim(),
        };
  
        // Update the statement and link on the server
        axios.put(`http://localhost:5000/pre_tour/${tour_id}`, updatedStatementData)
          .then(response => {
            setTours(pretour.map((tour) =>
              tour.id === tour_id ? { ...tour, ...updatedStatementData } : tour
            ));
            Swal.fire("Updated!", "The statement and link have been updated.", "success")
              .then(() => {
                window.location.reload();
              });
          })
          .catch(error => {
            Swal.fire("Error!", "There was an error updating the statement.", "error");
          });
      }
    });
  };

   // Update Post Tour
   const updatePostTour = (tour_id) => {
    const tour = posttour.find(t => t.id === tour_id);
    const { name, link } = tour || { name: "", link: "" };
  
    Swal.fire({
      title: "Post Tour Update",
      html: `
        <input type="text" id="name" class="swal2-input" placeholder="Enter new Task" value="${name}">
        <input type="url" id="link" class="swal2-input" placeholder="Enter new link" value="${link}">
      `,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Update",
      preConfirm: () => {
        const name = Swal.getPopup().querySelector('#name').value;
        const link = Swal.getPopup().querySelector('#link').value;
        
        // Check if statement and link are not empty
        if (!name.trim() || !link.trim()) {
          Swal.showValidationMessage('Please enter both name and link');
          return false;
        }
  
        // Check if link is a valid URL
        const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i; // Simple URL validation regex
        if (!urlPattern.test(link)) {
          Swal.showValidationMessage('Please enter a valid URL');
          return false;
        }
  
        return { name, link };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedStatementData = {
          name: result.value.name.trim(),
          link: result.value.link.trim(),
        };
  
        // Update the statement and link on the server
        axios.put(`http://localhost:5000/post_tour/${tour_id}`, updatedStatementData)
          .then(response => {
            setTours(posttour.map((tour) =>
              tour.id === tour_id ? { ...tour, ...updatedStatementData } : tour
            ));
            Swal.fire("Updated!", "The statement and link have been updated.", "success")
              .then(() => {
                window.location.reload();
              });
          })
          .catch(error => {
            Swal.fire("Error!", "There was an error updating the statement.", "error");
          });
      }
    });
  };

  const updateTax = (tour_id) => {
    const tour = taxes.find(t => t.id === tour_id);
    const { country, task_name, date, task_link } = tour || { country: "", task_name: "", date: "", task_link: "" };
  
    Swal.fire({
      title: "Tax Variation Update",
      html: `
        <input type="text" id="country" class="swal2-input" placeholder="Enter new country" value="${country}">
        <input type="text" id="task" class="swal2-input" placeholder="Enter new task" value="${task_name}">
        <input type="date" id="date" class="swal2-input" placeholder="Enter new date" value="${date}">
        <input type="url" id="link" class="swal2-input" placeholder="Enter new link">
      `,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Update",
      preConfirm: () => {
        const country = Swal.getPopup().querySelector('#country').value;
        const task_name = Swal.getPopup().querySelector('#task').value;
        const date = Swal.getPopup().querySelector('#date').value;
        const task_link = Swal.getPopup().querySelector('#link').value;
  
        // Check if statement and link are not empty
        if (!country.trim() || !task_name.trim() || !date.trim() || !task_link.trim()) {
          Swal.showValidationMessage('Please enter all fields');
          return false;
        }
  
        // Check if link is a valid URL
        const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i; // Simple URL validation regex
        if (!urlPattern.test(task_link)) {
          Swal.showValidationMessage('Please enter a valid URL');
          return false;
        }
  
        return { country, task_name, date, task_link };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedStatementData = {
          country: result.value.country.trim(),
          task_name: result.value.task_name.trim(),
          date: result.value.date.trim(),
          task_link: result.value.task_link.trim(),
        };
  
        // Update the statement and link on the server
        axios.put(`http://localhost:5000/tax_variation/${tour_id}`, updatedStatementData)
          .then(response => {
            setTaxes(taxes.map((tour) =>
              tour.id === tour_id ? { ...tour, ...updatedStatementData } : tour
            ));
            Swal.fire("Updated!", "The statement and link have been updated.", "success")
              .then(() => {
                window.location.reload();
              });
          })
          .catch(error => {
            Swal.fire("Error!", "There was an error updating the statement.", "error");
          });
      }
    });
  };  
  // Update the Contractors
  const updatedContractor = (tour_id) => {
    const tour = contracts.find(t => t.id === tour_id);
    const { payment, people, trip_country, people_oversea, trip_oversea, notes } = tour || { payment: "", people: "", trip_country: "", people_oversea: "", trip_oversea: "", notes: "" };
  
    Swal.fire({
      title: "Contrators Update",
      html: `
        <p>Enter new payment</p>
        <input type="text" id="payment" class="swal2-input" placeholder="Enter new payment" value="${payment}">
        <p>Enter new people in country</p>
        <input type="url" id="people" class="swal2-input" placeholder="Enter new people in country" value="${people}">
        <p>Enter new trip country</p>
        <input type="text" id="trip_country" class="swal2-input" placeholder="Enter new trip country" value="${trip_country}">
        <p>Enter new trip country</p>
        <input type="url" id="people_oversea" class="swal2-input" placeholder="Enter new people oversea" value="${people_oversea}">
        <p>Enter new trip oversea</p>
        <input type="text" id="trip_oversea" class="swal2-input" placeholder="Enter new trip oversea" value="${trip_oversea}">
        <p>Enter new notes</p>
        <input type="url" id="notes" class="swal2-input" placeholder="Enter new notes" value="${notes}">
      `,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Update",
      preConfirm: () => {
        const payment = Swal.getPopup().querySelector('#payment').value;
        const people = Swal.getPopup().querySelector('#people').value;
        const trip_country = Swal.getPopup().querySelector('#trip_country').value;
        const people_oversea = Swal.getPopup().querySelector('#people_oversea').value;
        const trip_oversea = Swal.getPopup().querySelector('#trip_oversea').value;
        const notes = Swal.getPopup().querySelector('#notes').value;
        
        // Check if statement and link are not empty
        if ( !payment.trim() || !people.trim() || !trip_country.trim() || !people_oversea.trim() || !trip_oversea.trim() || !notes.trim()) {
          Swal.showValidationMessage('Please enter both statement and link');
          return false;
        }
  
        return { payment, people, trip_country, people_oversea, trip_oversea, notes};
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedStatementData = {
          payment: result.value.payment.trim(),
          people: result.value.people.trim(),
          trip_country: result.value.trip_country.trim(),
          people_oversea: result.value.people_oversea.trim(),
          trip_oversea: result.value.trip_oversea.trim(),
          notes: result.value.notes.trim(),
        };
  
        // Update the statement and link on the server
        axios.put(`http://localhost:5000/contractor/${tour_id}`, updatedStatementData)
          .then(response => {
            setContracts(contracts.map((tour) =>
              tour.id === tour_id ? { ...tour, ...updatedStatementData } : tour
            ));
            Swal.fire("Updated!", "The statement and link have been updated.", "success")
              .then(() => {
                window.location.reload();
              });
          })
          .catch(error => {
            Swal.fire("Error!", "There was an error updating the statement.", "error");
          });
      }
    });
  };

  const deleteContract = (tour_id) => {
    console.log("Tour ID to delete:", tour_id); 
  
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
        axios.delete(`http://localhost:5000/contractor/${tour_id}`)
          .then(response => {
            setContracts(contracts.filter(contracts => contracts.id !== tour_id));  // Update state locally
            Swal.fire("Deleted!", "The artist has been deleted.", "success")
              .then(() => {
                // Reload the window after the Swal dialog finishes
                window.location.reload();
              });
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
        <div className="text-gray-800 text-md font-bold uppercase">
          <span>Tour Information</span>
        </div>
      </div>
      <div className="flex justify-between gap-3 w-full">
  <div className="bg-[#fff] p-4 rounded-lg w-full">
    <div className="overflow-x-auto w-full">
      <table className="min-w-full bg-white border border-[#ccc]">
        <thead className="whitespace-nowrap">
          <tr>
            <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Tour Name</th>
            <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Place</th>
            <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Expected Income</th>
            <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Date</th>
          </tr>
        </thead>
        <tbody>
          {tours.length > 0 ? (
            tours.map((tour) => (
              <tr key={tour.id} className="hover:bg-gray-100 even:bg-gray-50">
                <td className="p-4 text-sm text-gray-800">{tour.name}</td>
                <td className="p-4 text-sm text-gray-800">{tour.place}</td>
                <td className="p-4 text-sm text-gray-800">${tour.income}</td>
                <td className="p-4 text-sm text-gray-800">
                  {new Date(tour.date).toLocaleDateString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-4 text-center text-sm text-gray-500">
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>
      <div className="flex justify-between gap-3 w-full mt-4">
        <div className="w-2/12">
          <div className={`bg-white text-center p-4 mb-2 rounded-full px-10 hover:bg-[#787878] hover:text-white cursor-pointer 
            ${showtab==1?"!bg-[#787878] text-white":''}`} onClick={()=> setShowTab(1)}>
            Pre tour
          </div>
          <div className={`bg-white text-center p-4 mb-2 rounded-full px-10 hover:bg-[#787878] hover:text-white cursor-pointer ${showtab==2?"!bg-[#787878] text-white":''}`} onClick={()=> setShowTab(2)}>
            Tax variation
          </div>
          <div className={`bg-white text-center p-4 mb-2 rounded-full px-10 hover:bg-[#787878] hover:text-white cursor-pointer ${showtab==3?"!bg-[#787878] text-white":''}`} onClick={()=> setShowTab(3)}>
            Contractors
          </div>
          <div className={`bg-white text-center p-4 mb-2 rounded-full px-10 hover:bg-[#787878] hover:text-white cursor-pointer ${showtab==4?"!bg-[#787878] text-white":''}`} onClick={()=> setShowTab(4)}>
            Insurances
          </div>
          <div className={`bg-white text-center p-4 mb-2 rounded-full px-10 hover:bg-[#787878] hover:text-white cursor-pointer ${showtab==5?"!bg-[#787878] text-white":''}`} onClick={()=> setShowTab(5)}>
            Post tour
          </div>
        </div>
        <div className="w-10/12">
        {/* TAB 1 */}
        {
          showtab == 1 &&
          <div className="bg-[#fff] p-4 rounded-lg w-full">
  <div className="flex justify-end">
    <button
      onClick={() => setShowhide(!showhide)}
      type="button"
      className="px-5 py-2 mb-2 rounded-full text-white text-xs tracking-wider border border-current outline-none hover:bg-[#202020] bg-[#56AEFB]"
    >
      Add Statement
    </button>
  </div>
  <div className="overflow-x-auto w-full">
    <table className="min-w-full bg-white border-1 border-[#ccc]">
      <thead className="whitespace-nowrap">
        <tr>
          <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">
            Statements
          </th>
          <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Links</th>
          <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Status</th>
          <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Action</th>
        </tr>
      </thead>
      <tbody className="whitespace-nowrap">
        {
          pretour.length === 0 &&
          <tr className="hover:bg-gray-100 even:bg-[#f0f0f0]">
            <td colSpan={3} className="p-4 text-sm font-semibold text-center text-[#f00]">No Statement found!</td>
            
          </tr>
        }
        {
          pretour.map((statement, ind) => {
            return (
              <tr className="hover:bg-gray-100 even:bg-[#f0f0f0]" key={ind}>
                <td className="p-4 text-sm text-gray-800">{statement.statements}</td>
                <td className="p-4 text-sm text-gray-800">
                  <a className="text-[#6767ff]" href={statement?.link} target="_blank" rel="noopener noreferrer">
                    {statement?.link}
                  </a>
                </td>
                <td className="p-4 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    name="status"
                    checked={statement?.status === "Checked"}
                    className="mr-2"
                    value={statement?.status}
                    onChange={(e) => changeStatementStatus(e, statement?.id)}
                  />
                    
                </td>
                <td className="gap-2 flex">
                <td className="px-5 py-2 mb-5 mt-6 rounded-full text-white text-xs tracking-wider border border-current outline-none hover:bg-[#88d2fd] bg-[#56AEFB]"><button
                onClick={() => updatePreTour(statement.id)}>Edit</button></td>
                    <td className="px-5 py-2 mb-5 mt-6 rounded-full text-white text-xs tracking-wider border border-current outline-none hover:bg-[#fa7676] bg-[#fb5656]"><button 
                    onClick={() => {
                      deletePreTour(statement.id);
                    }}>Delete</button></td>
                    </td>
              </tr>
            );
          })
        }
      </tbody>
    </table>
  </div>
</div>  
        }
        {/* TAB 2 */}
        {
          showtab == 2 &&
            <div className="bg-[#fff] p-4 rounded-lg w-full">
               <div className="flex justify-end">
                  <button
                    onClick={() => setShowhide(!showhide)}
                    type="button"
                    className="px-5 py-2 mb-2 rounded-full text-white text-xs tracking-wider border border-current outline-none hover:bg-[#202020] bg-[#56AEFB]"
                  >
                    Add Task
                  </button>
                </div>
              <div className="overflow-x-auto w-full">
                <table className="min-w-full bg-white border-1 border-[#ccc]">
                  <thead className="whitespace-nowrap">
                    <tr>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Country</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">
                      Task
                      </th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">
                      Date
                      </th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Links</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Status</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="whitespace-nowrap">
                   {
                      taxes.length == 0 &&
                          <tr className="hover:bg-gray-100 even:bg-[#f0f0f0]">
                            <td colSpan={5} className="p-4 text-sm font-semibold text-center text-[#f00]">No information found!</td>
                          </tr>
                    }
                    {
                      taxes?.map((tax, ind) => {
                        return (
                          <tr className="hover:bg-gray-100 even:bg-[#f0f0f0]">
                            <td className="p-4 text-sm text-gray-800">{tax.country}</td>
                            <td className="p-4 text-sm text-gray-800">{tax.task_name}</td>
                            <td className="p-4 text-sm text-gray-800">{formatDate(tax.date)}</td>
                            <td className="p-4 text-sm text-gray-800"><a className="text-[#6767ff]" href={tax.task_link} target="_blank">{tax.task_link}</a></td>
                            <td className="p-4 text-sm text-gray-800">
                              <select name="status" onChange={(e) => changeTaxStatus(e, tax.id)} className="p-2 px-4 rounded-full">
                                <option value="For Review" selected={tax.status == "For Review"} >For Review</option>
                                <option value="In Progress" selected={tax.status == "In Progress"}>In Progress</option>
                                <option value="Done" selected={tax.status == "Done"}>Done</option>
                              </select>
                              {/* <input type="checkbox" name="status" checked={statements.status == 1 ? true : false} className="mr-2" value={1} onChange={(e) => changeStatementStatus(e, statements.id)} /> */}
                            </td>
                            <td className="gap-2 flex">
                <td className="px-5 py-2 mb-5 mt-6 rounded-full text-white text-xs tracking-wider border border-current outline-none hover:bg-[#88d2fd] bg-[#56AEFB]"><button
                onClick={() => updateTax(tax.id)}>Edit</button></td>
                    <td className="px-5 py-2 mb-5 mt-6 rounded-full text-white text-xs tracking-wider border border-current outline-none hover:bg-[#fa7676] bg-[#fb5656]"><button 
                    onClick={() => {
                      deleteTax(tax.id);
                    }}>Delete</button></td>
                    </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
        }

        {/* TAB 3 */}
        {
          showtab == 3 &&
            <div className="bg-[#fff] p-4 rounded-lg w-full">
               <div className="flex justify-end">
                  <button
                    onClick={() => setShowhide(!showhide)}
                    type="button"
                    className="px-5 py-2 mb-2 rounded-full text-white text-xs tracking-wider border border-current outline-none hover:bg-[#202020] bg-[#56AEFB]"
                  >
                    Add Information
                  </button>
                </div>
              <div className="overflow-x-auto w-full">
                <table className="min-w-full bg-white border-1 border-[#ccc]">
                  <thead className="whitespace-nowrap">
                    <tr>
                      <th className="p-4 text-left text-xs font-semibold text-gray-800 bg-[#f0f0f0]">Expected contractors
                      <br />payments</th>
                      <th className="p-4 text-left text-xs font-semibold text-gray-800 bg-[#f0f0f0]">
                      No. people within 
                      <br />the country
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-gray-800 bg-[#f0f0f0]">
                      No. trips within <br />the country
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-gray-800 bg-[#f0f0f0]">No. people <br />overseas</th>
                      <th className="p-4 text-left text-xs font-semibold text-gray-800 bg-[#f0f0f0]">No. trips <br />overseas</th>
                      <th className="p-4 text-left text-xs font-semibold text-gray-800 bg-[#f0f0f0]">Other<br />notes</th>
                      <th className="p-4 text-left text-xs font-semibold text-gray-800 bg-[#f0f0f0]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="whitespace-nowrap">
                   {
                      contracts.length == 0 &&
                          <tr className="hover:bg-gray-100 even:bg-[#f0f0f0]">
                            <td colSpan={6} className="p-4 text-sm font-semibold text-center text-[#f00]">No information found!</td>
                          </tr>
                    }
                    {
                      contracts?.map((contract, ind) => {
                        return (
                          <tr className="hover:bg-gray-100 even:bg-[#f0f0f0]" key={ind}>
                            <td className="p-4 text-sm text-gray-800">{parseFloat(contract.payment)}</td>
                            <td className="p-4 text-sm text-gray-800">{contract.people}</td>
                            <td className="p-4 text-sm text-gray-800">{contract.trip_country}</td>
                            <td className="p-4 text-sm text-gray-800">{contract.people_oversea}</td>
                            <td className="p-4 text-sm text-gray-800">{contract.trip_oversea}</td>
                            <td className="p-4 text-sm text-gray-800">{contract.notes}</td>
                            <td className="gap-2 flex">
                <td className="px-5 py-2 mb-5 mt-6 rounded-full text-white text-xs tracking-wider border border-current outline-none hover:bg-[#88d2fd] bg-[#56AEFB]"><button
                onClick={() => updatedContractor(contract.id)}>Edit</button></td>
                    <td className="px-5 py-2 mb-5 mt-6 rounded-full text-white text-xs tracking-wider border border-current outline-none hover:bg-[#fa7676] bg-[#fb5656]"><button 
                    onClick={() => {
                      deleteContract(contract.id);
                    }}>Delete</button></td>
                    </td>
                          </tr>
                          
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
        }
        {/* TAB 4 */}
        {
          showtab == 4 &&
          <>
             <div className="bg-[#fff] p-4 rounded-lg w-full">
              <div className="overflow-x-auto w-full">
                <table className="min-w-full bg-white border-1 border-[#ccc]">
                  <thead className="whitespace-nowrap">
                    <tr>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Start date</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">End date</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Current balance</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Required balance:</th>
                      
                    </tr>
                  </thead>
                  <tbody className="whitespace-nowrap">
                      <tr className="hover:bg-gray-100 bg-[#fafafa]">
                        <td className="p-4 text-sm text-gray-800">{formatDate(artists.startdate)}</td>
                        <td className="p-4 text-sm text-gray-800">{formatDate(artists.enddate)}</td>
                        <td className="p-4 text-sm text-gray-800">${artists.insurance_balance}</td>
                        <td className="p-4 text-sm text-gray-800">
                        <input
                                  type="number"
                                  className="p-2 px-4 bg-[#e4e4e4]"
                                  min={0}
                                  step={0.01}
                                  defaultValue={requiredbalance}
                                  value={requiredbalance}
                                  onChange={(e) => setRequiredBalance(e.target.value)}
                                />
                                <button
                                  className="bg-blue-500 text-white py-2 px-4 rounded-full ml-2"
                                  onClick={saveInsurance}
                                >
                                  {edit ? "Update" : "Save"}
                                </button>
                        </td>
                      </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#fff] p-4 rounded-lg w-full mt-4">
              <div className="overflow-x-auto w-full">
                <table className="min-w-full bg-white border-1 border-[#ccc]">
                  <thead className="whitespace-nowrap">
                    <tr>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Public Liability Coverage</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Notes</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="whitespace-nowrap">
                      <tr className="hover:bg-gray-100 even:bg-[#f0f0f0]">
                        <td className="p-4 text-sm text-gray-800 w-[40%]">Covered by Current PLI Turnover policy</td>
                        <td className="p-4 text-sm text-gray-800"><textarea className="border p-2 text-xs border-[#f0f0f0] w-[300px]" 
                        value={liability.notes} 
                        onChange={(e) => change_insurance_data(e.target.value, 'liability', 'notes')} /></td>
                        <td className="p-4 text-sm text-gray-800"><FaCircleCheck size={30} color={Number(artists.insurance_balance) >= requiredbalance ? "green": "grey"} /></td>
                      </tr> 
                  </tbody>
                </table>
              </div>
            </div>


            <div className="bg-[#fff] p-4 rounded-lg w-full mt-4">
              <div className="overflow-x-auto w-full">
                <table className="min-w-full bg-white border-1 border-[#ccc]">
                  <thead className="whitespace-nowrap">
                    <tr>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Travel Insurance Coverage</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Notes</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="whitespace-nowrap">
                      <tr className="hover:bg-gray-100 even:bg-[#f0f0f0]">
                        <td className="p-4 text-sm text-gray-800 w-[40%]">Covered by Current Travel Insurance period?</td>
                        <td className="p-4 text-sm text-gray-800"> <textarea
                        className="border p-2 text-xs border-[#f0f0f0] w-[300px]"
                        value={insurance ? insurance.notes : ''}  // Ensure insurance is not null
                        onChange={(e) => change_insurance_data(e.target.value, 'insurance', 'notes')}
                      /></td>
                        <td className="p-4 text-sm text-gray-800"><FaCircleCheck size={30} color={Number(artists.insurance_balance) >= requiredbalance ? "green": "grey"}  /></td>
                      </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#fff] p-4 rounded-lg w-full mt-4">
              <div className="overflow-x-auto w-full">
                <table className="min-w-full bg-white border-1 border-[#ccc]">
                  <thead className="whitespace-nowrap">
                    <tr>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Equipment Insurance</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Notes</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="whitespace-nowrap">
                      <tr className="hover:bg-gray-100 even:bg-[#f0f0f0]">
                        <td className="p-4 text-sm text-gray-800 w-[40%]">Covered by Current Equipment Insurance period?</td>
                        <td className="p-4 text-sm text-gray-800"><textarea className="border p-2 text-xs border-[#f0f0f0] w-[300px]" value={equipment.notes} onChange={(e) => change_insurance_data(e.target.value, 'equipment', 'notes')} /></td>
                        <td className="p-4 text-sm text-gray-800"><FaCircleCheck size={30} color={Number(artists.insurance_balance) >= requiredbalance ? "green": "grey"}  /></td>
                      </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#fff] p-4 rounded-lg w-full mt-4">
              <div className="overflow-x-auto w-full">
                <table className="min-w-full bg-white border-1 border-[#ccc]">
                  <thead className="whitespace-nowrap">
                    <tr>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Work cover</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Notes</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="whitespace-nowrap">
                      <tr className="hover:bg-gray-100 even:bg-[#f0f0f0]">
                        <td className="p-4 text-sm text-gray-800 w-[40%]">Workcover in place for contractors?</td>
                        <td className="p-4 text-sm text-gray-800"><textarea className="border p-2 text-xs border-[#f0f0f0] w-[300px]" value={workcover.notes} onChange={(e) => change_insurance_data(e.target.value, 'cover', 'notes')} /></td>
                        <td className="p-4 text-sm text-gray-800"><FaCircleCheck size={30} color={Number(artists.insurance_balance) >= requiredbalance ? "green": "grey"}  /></td>
                      </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        }

        {/* TAB 5 */}
        {
          showtab == 5 &&
            <div className="bg-[#fff] p-4 rounded-lg w-full">
               <div className="flex justify-end">
                  <button
                    onClick={() => setShowhide(!showhide)}
                    type="button"
                    className="px-5 py-2 mb-2 rounded-full text-white text-xs tracking-wider border border-current outline-none hover:bg-[#202020] bg-[#56AEFB]"
                  >
                    Add Task/notes
                  </button>
                </div>
              <div className="overflow-x-auto w-full">
                <table className="min-w-full bg-white border-1 border-[#ccc]">
                  <thead className="whitespace-nowrap">
                    <tr>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">
                      Task/Notes
                      </th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Links</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Status</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-800 bg-[#f0f0f0]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="whitespace-nowrap">
                   {
                      posttour.length == 0 &&
                          <tr className="hover:bg-gray-100 even:bg-[#f0f0f0]">
                            <td colSpan={3} className="p-4 text-sm font-semibold text-center text-[#f00]">No Tasks/notes found!</td>
                          </tr>
                    }
                    {
                      posttour?.map((item, ind) => {
                        return (
                          <tr className="hover:bg-gray-100 even:bg-[#f0f0f0]">
                            <td className="p-4 text-sm text-gray-800">{item.name}</td>
                            <td className="p-4 text-sm text-gray-800"><a className="text-[#6767ff]" href={item.link} target="_blank">{item.link}</a></td>
                            <td className="p-4 text-sm text-gray-800">
                              <select name="status" onChange={(e) => changeTaskStatus(e, item.id)} className="p-2 px-4 rounded-full">
                              <option value="For Review" selected={item.status == "For Review"} >For Review</option>
                                <option value="In Progress" selected={item.status == "In Progress"}>In Progress</option>
                                <option value="Done" selected={item.status == "Done"}>Done</option>
                              </select>
                              {/* <input type="checkbox" name="status" checked={statements.status == 1 ? true : false} className="mr-2" value={1} onChange={(e) => changeStatementStatus(e, statements.id)} /> */}
                              
                            </td>
                            <td className="gap-2 flex">
                <td className="px-5 py-2 mb-5 mt-6 rounded-full text-white text-xs tracking-wider border border-current outline-none hover:bg-[#88d2fd] bg-[#56AEFB]"><button
                onClick={() => updatePostTour(item.id)}>Edit</button></td>
                    <td className="px-5 py-2 mb-5 mt-6 rounded-full text-white text-xs tracking-wider border border-current outline-none hover:bg-[#fa7676] bg-[#fb5656]"><button 
                    onClick={() => {
                      deletePostTour(item.id);
                    }}>Delete</button></td>
                    </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
        }
        </div>
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
                }}
              >
                <IoIosCloseCircle size={26} color="#ff6767" />
              </div>
            {
              showtab == 1 &&
              <>
                <h4 class="text-xl font-bold uppercase mb-1 text-center">
                Add Statement
                </h4>
                <form class="mt-6" onSubmit={(e) => do_save_statement(e)}>
                  <div class="form-group mb-4">
                    <input
                      type="text"
                      class="form-control"
                      id="name"
                      name="name"
                      placeholder="Enter Statement"
                      required
                      value={statementname}
                      onChange={(e) => setStatementName(e.target.value)}
                    />
                  </div>
                  <div class="form-group mb-4">
                    <input
                      type="url"
                      class="form-control"
                      id="link"
                      name="link"
                      placeholder="Enter Links"
                      required
                      value={statementlink}
                      onChange={(e) => setStatementLink(e.target.value)}
                    />
                  </div>
                  <div class="form-group">
                    <button type="submit" class="button_main w-full text-white">
                      Save
                    </button>
                  </div>
                </form>
              </>
            }

            {
              showtab == 2 &&
              <>
                <h4 class="text-xl font-bold uppercase mb-1 text-center">
                Add Tax Tasks
                </h4>
                <form class="mt-6" onSubmit={(e) => do_save_tax_variation_statement(e)}>
                <div class="form-group mb-4">
                    <input
                      type="text"
                      class="form-control"
                      id="name"
                      name="name"
                      placeholder="Enter Country"
                      required
                      value={countrytax}
                      onChange={(e) => setCountryTax(e.target.value)}
                    />
                  </div>
                  <div class="form-group mb-4">
                    <input
                      type="text"
                      class="form-control"
                      id="name"
                      name="name"
                      placeholder="Enter Task"
                      required
                      value={statementname}
                      onChange={(e) => setStatementName(e.target.value)}
                    />
                  </div>
                  <div class="form-group mb-4">
                    <input
                      type="url"
                      class="form-control"
                      id="link"
                      name="link"
                      placeholder="Enter Links"
                      required
                      value={statementlink}
                      onChange={(e) => setStatementLink(e.target.value)}
                    />
                  </div>
                  <div class="form-group mb-4">
                    <input
                      type="date"
                      class="form-control"
                      id="date"
                      name="date"
                      placeholder="Enter Date"
                      required
                      value={datetax}
                      onChange={(e) => setDateTax(e.target.value)}
                    />
                  </div>
                  <div class="form-group">
                    <button type="submit" class="button_main w-full text-white">
                    Save
                    </button>
                  </div>
                </form>
              </>
            }

          {
              showtab == 3 &&
              <>
                <h4 class="text-xl font-bold uppercase mb-1 text-center">
                Add Contractors
                </h4>
                <form class="mt-6" onSubmit={(e) => do_save_contracts(e)}>
                <div class="form-group mb-4">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      class="form-control"
                      id="name"
                      name="name"
                      placeholder="Enter Expected contractors payments"
                      required
                      value={payment}
                      onChange={(e) => setPayment(e.target.value)}
                    />
                  </div>
                  <div class="form-group mb-4">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      class="form-control"
                      id="name"
                      name="name"
                      placeholder="Enter No. people within the country"
                      required
                      value={people}
                      onChange={(e) => setPeople(e.target.value)}
                    />
                  </div>
                  <div class="form-group mb-4">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      class="form-control"
                      id="link"
                      name="link"
                      placeholder="Enter No. trips within the country"
                      required
                      value={trip_country}
                      onChange={(e) => setTripCountry(e.target.value)}
                    />
                  </div>
                  <div class="form-group mb-4">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      class="form-control"
                      id="date"
                      name="date"
                      placeholder="Enter No. people overseas"
                      required
                      value={people_oversea}
                      onChange={(e) => setPeopleOversea(e.target.value)}
                    />
                  </div>
                  <div class="form-group mb-4">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      class="form-control"
                      id="date"
                      name="date"
                      placeholder="Enter No. trips overseas"
                      required
                      value={trip_oversea}
                      onChange={(e) => setTripOversea(e.target.value)}
                    />
                  </div>
                  <div class="form-group mb-4">
                    <input
                      type="text"
                      class="form-control"
                      id="date"
                      name="date"
                      placeholder="Enter Notes"
                      required
                      value={notes}
                      onChange={(e) => setOtherNotes(e.target.value)}
                    />
                  </div>
                  <div class="form-group">
                    <button type="submit" class="button_main w-full text-white">
                    Save
                    </button>
                  </div>
                </form>
              </>
            }

            {
              showtab == 5 &&
              <>
                <h4 class="text-xl font-bold uppercase mb-1 text-center">
                  Add Task/Notes
                </h4>
                <form class="mt-6" onSubmit={(e) => do_save_tasks(e)}>
                  <div class="form-group mb-4">
                    <input
                      type="text"
                      class="form-control"
                      id="name"
                      name="name"
                      placeholder="Enter Task/Notes"
                      required
                      value={statementname}
                      onChange={(e) => setStatementName(e.target.value)}
                    />
                  </div>
                  <div class="form-group mb-4">
                    <input
                      type="url"
                      class="form-control"
                      id="link"
                      name="link"
                      placeholder="Enter Links"
                      required
                      value={statementlink}
                      onChange={(e) => setStatementLink(e.target.value)}
                    />
                  </div>
                  <div class="form-group">
                    <button type="submit" class="button_main w-full text-white">
                    Save
                    </button>
                  </div>
                </form>
              </>
            }
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
export default TourDetails;
