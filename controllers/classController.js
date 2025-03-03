import Class from "../models/Class.js";
import Trainer from "../models/Trainer.js";

// Create a new class
export const createClass = async (req, res) => {
  try {
    const { trainer_id, class_name, max_capacity, start_time, duration_mins } = req.body;

    // Validate if the trainer exists
    const trainerExists = await Trainer.findById(trainer_id);
    if (!trainerExists) {
      return res.status(400).json({ success: false, message: "Invalid trainer ID. Trainer not found." });
    }

    // Convert start_time to Date object
    const startTime = new Date(start_time);
    const endTime = new Date(startTime.getTime() + duration_mins * 60000); // Calculate end time

    // Check for overlapping classes
    const overlappingClass = await Class.findOne({
      trainer_id,
      $or: [
        // Case 1: New class starts during an existing class
        {
          start_time: { $lt: endTime },
          $expr: { $gt: [{ $add: ["$start_time", { $multiply: ["$duration_mins", 60000] }] }, startTime] }
        },

        // Case 2: New class ends during an existing class
        { start_time: { $gte: startTime, $lt: endTime } }
      ],
    });

    if (overlappingClass) {
      return res.status(400).json({
        success: false,
        message: "Trainer already has a class scheduled during this time.",
      });
    }

    // Create the new class
    const newClass = new Class({ trainer_id, class_name, max_capacity, start_time, duration_mins });
    await newClass.save();

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get all classes
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate({
        path: "trainer_id",
        populate: {
          path: "user_id", // This assumes 'user_id' exists in Trainer model
          model: "User",
          select: "first_name last_name email phone_number"
        }
      });

    const formattedClasses = classes.map((cls) => {
      const classObj = cls.toObject(); // Convert to plain JS object

      if (classObj.trainer_id?.user_id) {
        classObj.trainer_id.user = classObj.trainer_id.user_id; // Rename 'user_id' to 'user'
        delete classObj.trainer_id.user_id; // Remove the original 'user_id'
      }
      classObj.trainer = classObj.trainer_id;
      delete classObj.trainer_id;

      return classObj;
    });

    res.json(formattedClasses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a class by ID
export const getClassById = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id).populate({
      path: "trainer_id",
      populate: {
        path: "user_id", // This assumes 'user_id' exists in Trainer model
        model: "User",
        select: "first_name last_name email phone_number"
      }
    });

    if (!classItem) return res.status(404).json({ message: "Class not found" });

    const classObj = classItem.toObject(); // Convert to plain JS object

    if (classObj.trainer_id?.user_id) {
      classObj.trainer_id.user = classObj.trainer_id.user_id; // Rename 'user_id' to 'user'
      delete classObj.trainer_id.user_id; // Remove the original 'user_id'
    }
    classObj.trainer = classObj.trainer_id;
    delete classObj.trainer_id;


    res.json(classObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a class
export const updateClass = async (req, res) => {
  try {
    const { trainer_id, class_name, max_capacity, start_time, duration_mins } = req.body;

    // Find the existing class
    const existingClass = await Class.findById(req.params.id);
    if (!existingClass) return res.status(404).json({ message: "Class not found" });

    // Use existing values if not provided in the request
    const updatedTrainerId = trainer_id ?? existingClass.trainer_id;
    const updatedStartTime = start_time ? new Date(start_time) : existingClass.start_time;
    const updatedDuration = duration_mins ?? existingClass.duration_mins;

    if (isNaN(updatedStartTime.getTime())) {
      return res.status(400).json({ message: "Invalid date format for start_time." });
    }

    // Compute new class end time
    const updatedEndTime = new Date(updatedStartTime.getTime() + updatedDuration * 60000);

    // Check if another class overlaps with the new schedule
    const overlappingClass = await Class.findOne({
      trainer_id: updatedTrainerId,
      _id: { $ne: existingClass._id }, // Exclude the current class from conflict check
      $or: [
        {
          // New class starts inside an existing class
          start_time: { $lt: updatedEndTime },
          $expr: {
            $gte: [{ $add: ["$start_time", { $multiply: ["$duration_mins", 60000] }] }, updatedStartTime]
          }
        },
        {
          // New class completely overlaps an existing class
          start_time: { $gte: updatedStartTime, $lt: updatedEndTime }
        }
      ]
    });

    if (overlappingClass) {
      return res.status(400).json({ message: "Trainer has another class scheduled during this time." });
    }

    // Proceed with updating the class
    existingClass.trainer_id = updatedTrainerId;
    existingClass.class_name = class_name ?? existingClass.class_name;
    existingClass.max_capacity = max_capacity ?? existingClass.max_capacity;
    existingClass.start_time = updatedStartTime;
    existingClass.duration_mins = updatedDuration;

    await existingClass.save();
    res.json(existingClass);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Delete a class
export const deleteClass = async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) return res.status(404).json({ message: "Class not found" });
    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Upcoming Available Classes
export const getUpcomingAvailableClasses = async (req, res) => {
  try {
    const { date, trainer_id, class_name } = req.query; // Extract filters
    const currentTime = new Date();

    let filters = {
      start_time: { $gt: currentTime }, // Only future classes
      max_capacity: { $gt: 0 }, // Ensure capacity is greater than 0
      status: "upcoming" // Ensure the class is upcoming
    };

    // Filter by Date (whole day range)
    if (date) {
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0); // Midnight UTC

      const endDate = new Date(date);
      endDate.setUTCHours(23, 59, 59, 999); // End of the day UTC
      console.log("A >> ", startDate, endDate);

      filters.start_time = { $gte: startDate, $lte: endDate };
    }

    // Filter by Multiple Trainer IDs
    if (trainer_id) {
      const trainerIds = Array.isArray(trainer_id)
        ? trainer_id
        : trainer_id.split(","); // Convert comma-separated values to an array

      filters.trainer_id = { $in: trainerIds };
    }

    // Filter by Class Name (Partial Search, Case-Insensitive)
    if (class_name) {
      filters.class_name = { $regex: class_name, $options: "i" };
    }

    // Query the database with filters
    const upcomingClasses = await Class.find(filters)
      .populate({
        path: "trainer_id",
        populate: {
          path: "user_id",
          model: "User",
          select: "first_name last_name email phone_number"
        }
      })
      .sort({ start_time: 1 });
    const formattedClasses = upcomingClasses.map((classItem) => {
      const classObj = classItem.toObject(); // Convert to plain JS object

      if (classObj.trainer_id?.user_id) {
        classObj.trainer_id.user = classObj.trainer_id.user_id;
        delete classObj.trainer_id.user_id;
      }

      classObj.trainer = classObj.trainer_id;
      delete classObj.trainer_id;

      return classObj;
    });

    res.json(formattedClasses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

