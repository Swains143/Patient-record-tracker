import { useState, useEffect } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { format } from "date-fns";

// Firebase imports
import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const ITEMS_PER_PAGE = 10;

export default function PatientRecords() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    name: "",
    regNo: "",
    hospital: "",
    date: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterHospital, setFilterHospital] = useState("");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDesc, setSortDesc] = useState(true);

  // Fetch records from Firestore on load
  useEffect(() => {
    const fetchRecords = async () => {
      const querySnapshot = await getDocs(collection(db, "patientRecords"));
      const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(recordsData);
    };
    fetchRecords();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addRecord = async () => {
    if (!form.name || !form.regNo || !form.hospital || !form.date) return;

    const newRecord = { ...form };
    const docRef = await addDoc(collection(db, "patientRecords"), newRecord);

    setRecords(prev => [...prev, { id: docRef.id, ...newRecord }]);
    setForm({ name: "", regNo: "", hospital: "", date: "" });
  };

  const deleteRecord = async (id) => {
    await deleteDoc(doc(db, "patientRecords", id));
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterHospital("");
    setFilterDateStart("");
    setFilterDateEnd("");
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = ["Name", "Reg No", "Hospital", "Date"];
    const rows = records.map((r) => [r.name, r.regNo, r.hospital, r.date]);
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "patient_records.csv";
    link.click();
  };

  // Filtering & Sorting
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.regNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHospital = filterHospital ? r.hospital === filterHospital : true;
    const matchesDate =
      (!filterDateStart || new Date(r.date) >= new Date(filterDateStart)) &&
      (!filterDateEnd || new Date(r.date) <= new Date(filterDateEnd));
    return matchesSearch && matchesHospital && matchesDate;
  });

  const sortedFilteredRecords = [...filteredRecords].sort((a, b) =>
    sortDesc ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
  );

  const totalSessions = filteredRecords.length;
  const monthlyCount = filteredRecords.reduce((grouped, r) => {
    const monthKey = format(new Date(r.date), "yyyy-MM");
    grouped[monthKey] = (grouped[monthKey] || 0) + 1;
    return grouped;
  }, {});

  const hospitalCount = filteredRecords.reduce((grouped, r) => {
    grouped[r.hospital] = (grouped[r.hospital] || 0) + 1;
    return grouped;
  }, {});

  const hospitalOptions = [...new Set(records.map((r) => r.hospital))];

  const paginatedRecords = sortedFilteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">Patient Record Tracker</h1>

      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <Input placeholder="Patient Name" name="name" value={form.name} onChange={handleChange} />
          <Input placeholder="Registration Number" name="regNo" value={form.regNo} onChange={handleChange} />
          <Input placeholder="Hospital Name" name="hospital" value={form.hospital} onChange={handleChange} />
          <Input type="date" name="date" value={form.date} onChange={handleChange} />
          <Button className="col-span-full" onClick={addRecord}>Add Record</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Input placeholder="Search by name or reg no" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <select className="border rounded p-2" value={filterHospital} onChange={(e) => setFilterHospital(e.target.value)}>
            <option value="">All Hospitals</option>
            {hospitalOptions.map((hosp, i) => (
              <option key={i} value={hosp}>{hosp}</option>
            ))}
          </select>
          <Input type="date" value={filterDateStart} onChange={(e) => setFilterDateStart(e.target.value)} />
          <Input type="date" value={filterDateEnd} onChange={(e) => setFilterDateEnd(e.target.value)} />
          <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
          <Button variant="outline" onClick={() => setSortDesc(!sortDesc)}>
            Sort: {sortDesc ? "Newest First" : "Oldest First"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Session Statistics</h2>
          <p><strong>Total Sessions:</strong> {totalSessions}</p>
          <div>
            <h3 className="font-medium">Monthly Session Counts</h3>
            <ul className="list-disc list-inside">
              {Object.entries(monthlyCount).map(([month, count]) => (
                <li key={month}>{month}: <strong>{count}</strong> session(s)</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Sessions per Hospital</h3>
            <ul className="list-disc list-inside">
              {Object.entries(hospitalCount).map(([hospital, count]) => (
                <li key={hospital}>{hospital}: <strong>{count}</strong> session(s)</li>
              ))}
            </ul>
          </div>
          <Button onClick={exportToCSV}>Export to CSV</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-4">
          <h2 className="text-lg font-semibold mb-2">All Patient Records</h2>
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Reg No</th>
                <th className="border px-2 py-1">Hospital</th>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((rec) => (
                <tr key={rec.id}>
                  <td className="border px-2 py-1">{rec.name}</td>
                  <td className="border px-2 py-1">{rec.regNo}</td>
                  <td className="border px-2 py-1">{rec.hospital}</td>
                  <td className="border px-2 py-1">{rec.date}</td>
                  <td className="border px-2 py-1">
                    <Button variant="destructive" size="sm" onClick={() => deleteRecord(rec.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4">
            <Button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Previous</Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
