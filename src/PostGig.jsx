import React, { useState } from "react";

function PostGig({ onAddGig }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [skills, setSkills] = useState("");
  const [deadline, setDeadline] = useState("");
  const [experience, setExperience] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !title ||
      !category ||
      !description ||
      !budget ||
      !skills ||
      !deadline ||
      !experience
    ) {
      setError("Please fill in all the fields.");
      return;
    }

    if (description.length < 20) {
      setError("Description should be at least 20 characters.");
      return;
    }

    if (Number(budget) <= 0) {
      setError("Please enter a valid budget.");
      return;
    }

    const newGig = {
      id: Date.now(),
      title: title,
      category: category,
      description: description,
      budget: "₹" + Number(budget).toLocaleString("en-IN"),
      skills: skills,
      deadline: deadline,
      experience: experience,
      postedBy: "You",
      status: "open"
      
    };

    onAddGig(newGig);

    // Clear form
    setTitle("");
    setCategory("");
    setDescription("");
    setBudget("");
    setSkills("");
    setDeadline("");
    setExperience("");
    setError("");
  };

  return (
    <div className="post-page">

      {/* HEADER */}

      <div className="post-header">
        <p className="post-label">GIGNOVA FOR CLIENTS</p>

        <h1>Post a Gig</h1>

        <p>
          Tell talented freelancers what you need and find
          the right person for your project.
        </p>
      </div>


      {/* FORM */}

      <div className="post-layout">

        <div className="post-form-card">

          <div className="form-heading">
            <h2>Project Details</h2>
            <p>Give freelancers everything they need to understand your project.</p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* TITLE */}

            <div className="form-group">
              <label>Project Title *</label>

              <input
                type="text"
                placeholder="e.g. Build a modern React website"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <small>
                Make your title clear and specific.
              </small>
            </div>


            {/* CATEGORY + EXPERIENCE */}

            <div className="form-row">

              <div className="form-group">
                <label>Category *</label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">
                    Select category
                  </option>

                  <option value="Web Development">
                    Web Development
                  </option>

                  <option value="Graphic Design">
                    Graphic Design
                  </option>

                  <option value="Content Writing">
                    Content Writing
                  </option>

                  <option value="Digital Marketing">
                    Digital Marketing
                  </option>

                  <option value="Video Editing">
                    Video Editing
                  </option>

                  <option value="Data Entry">
                    Data Entry
                  </option>
                </select>
              </div>


              <div className="form-group">
                <label>Experience Level *</label>

                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                >
                  <option value="">
                    Select level
                  </option>

                  <option value="Beginner">
                    Beginner
                  </option>

                  <option value="Intermediate">
                    Intermediate
                  </option>

                  <option value="Expert">
                    Expert
                  </option>
                </select>
              </div>

            </div>


            {/* DESCRIPTION */}

            <div className="form-group">
              <label>Project Description *</label>

              <textarea
                placeholder="Describe your project, requirements, expected outcome and any important details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>

              <small>
                Minimum 20 characters
              </small>
            </div>


            {/* SKILLS */}

            <div className="form-group">
              <label>Required Skills *</label>

              <input
                type="text"
                placeholder="e.g. React, JavaScript, CSS, Figma"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />

              <small>
                Separate multiple skills with commas.
              </small>
            </div>


            {/* BUDGET + DEADLINE */}

            <div className="form-row">

              <div className="form-group">
                <label>Budget (₹) *</label>

                <div className="budget-input">
                  <span>₹</span>

                  <input
                    type="number"
                    placeholder="10000"
                    min="1"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>
              </div>


              <div className="form-group">
                <label>Project Deadline *</label>

                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

            </div>


            {/* ERROR */}

            {error && (
              <div className="post-error">
                ⚠ {error}
              </div>
            )}


            {/* BUTTON */}

            <button
              type="submit"
              className="post-submit"
            >
              Post My Gig →
            </button>

          </form>

        </div>


        {/* RIGHT SIDE */}

        <div className="post-sidebar">

          <div className="why-card">

            <h3>Why post on GigNova?</h3>

            <div className="benefit">
              <div>✓</div>

              <div>
                <strong>Find skilled freelancers</strong>
                <p>
                  Connect with people who have the
                  skills your project needs.
                </p>
              </div>
            </div>


            <div className="benefit">
              <div>✓</div>

              <div>
                <strong>Compare proposals</strong>
                <p>
                  Review freelancers and choose the
                  right fit for your project.
                </p>
              </div>
            </div>


            <div className="benefit">
              <div>✓</div>

              <div>
                <strong>Save time</strong>
                <p>
                  Get your project in front of talented
                  professionals quickly.
                </p>
              </div>
            </div>

          </div>


          <div className="tips-card">

            <h3>💡 Tips for a great gig</h3>

            <ul>
              <li>Use a clear project title</li>
              <li>Explain your requirements</li>
              <li>Mention the skills you need</li>
              <li>Set a realistic budget</li>
              <li>Give a reasonable deadline</li>
            </ul>

          </div>

        </div>

      </div>

    </div>
  );
}

export default PostGig;