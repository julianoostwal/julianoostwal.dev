export default function Create() {
    return (
        <main className="min-h-screen">
            <div className="container py-12 px-6 mx-auto p-4">
                <h1 className="text-4xl font-bold mb-6 text-center">Create a new project</h1>
                <div className="max-w-4xl mx-auto">
                    <p className="text-lg mb-6 leading-relaxed">
                        Fill in the form below to create a new project.
                    </p>

                    <form className="mt-6 flex flex-col" >
                        <label className="text-lg mb-2" htmlFor="title">Title</label>
                        <input type="text" id="title" name="title" className="input" />

                        <label className="text-lg mb-2" htmlFor="description">Description</label>
                        <textarea id="description" name="description" className="input" />

                        <label className="text-lg mb-2" htmlFor="url">URL</label>
                        <input type="text" id="url" name="url" className="input" />

                        <label className="text-lg mb-2" htmlFor="image">Image</label>
                        <input type="file" id="image" name="image" className="input" />

                        <button type="submit" className="button mt-4">Create project</button>
                    </form>
                </div>
            </div>
        </main>
    );
}