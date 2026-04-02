const { db } = require("../firebase");

exports.searchStudents = async (req, res) => {
  try {
    const { department, year, program, status } = req.query;
    let studentsRef = db.collection("students");
    if (department) studentsRef = studentsRef.where("department", "==", department);

    const snapshot = await studentsRef.get();
    let students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (year) students = students.filter(s => String(s.year) === String(year));

    // Further filter by program and status if needed (requires fetching participations)
    if (program || status) {
      const participationSnapshot = await db.collection("participations").get();
      const participations = participationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      students = students.filter(student => {
        return participations.some(p => {
          return p.studentId === student.id &&
                 (!program || p.programId === program) &&
                 (!status || p.status === status);
        });
      });
    }

    res.status(200).json({ message: "Search results from Firestore", students });
  } catch (error) {
    res.status(500).json({ message: "Error searching students", error: error.message });
  }
};
