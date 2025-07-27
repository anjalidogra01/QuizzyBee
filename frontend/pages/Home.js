const Home = {
  template: `
    <div class="container text-center mt-5">
        <div class="jumbotron bg-white shadow-lg rounded p-5">
            <h1 class="display-3 fw-bold text-gradient">Quiz Master</h1>
            <p class="lead text-secondary">Test your skills, challenge yourself, and climb the leaderboard!</p>
            <hr class="my-4">
            <p class="text-muted">Join now and start your journey to becoming a quiz champion.</p>
            <div class="d-flex justify-content-center mt-4">
    <router-link to="/login" class="mx-3">
        <button class="btn btn-lg btn-outline-purple px-4">Login</button>
    </router-link>
    <router-link to="/registe" class="mx-3">
        <button class="btn btn-lg btn-outline-purple px-4">Sign Up</button>
    </router-link>
</div>

        </div>
    </div>
    `
};

export default Home;
