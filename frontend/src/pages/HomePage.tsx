import NavBar from "../components/NavBar";
const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {/* Main Content */}

      <main className="flex-1 px-6 py-8 space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-2">Course</h2>
          <div className="border rounded p-4">
            {/* course content placeholder */}
            Course content goes here
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Homework</h2>
          <div className="border rounded p-4">
            {/* homework content placeholder */}
            Homework content goes here
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Quiz</h2>
          <div className="border rounded p-4">
            {/* quiz content placeholder */}
            Quiz content goes here
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
