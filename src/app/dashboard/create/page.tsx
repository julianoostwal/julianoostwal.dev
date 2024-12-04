import { Button, Input, Textarea } from "@nextui-org/react";
import { collection, addDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import firebase_app from "@/firebase/config";

export default function Create() {
  async function formSubmit(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const url = formData.get("url") as string;
    const imageInput = formData.get("image") as unknown as HTMLInputElement;
    const image = imageInput?.files?.[0];

    const db = getFirestore(firebase_app);
    const storage = getStorage(firebase_app);
    const projectsCollection = collection(db, "projects");

    let imageName = "";
    if (image) {
      try {
        const storageRef = ref(storage, `${image.name}`);
        await uploadBytes(storageRef, image);
        imageName = image.name;
      } catch (error) {
        console.error("Error uploading image: ", error);
      }
    }

    const newProject = {
      name: title,
      description,
      url,
      image: imageName,
    };
    await addDoc(projectsCollection, newProject);

    formData.delete("title");
    formData.delete("description");
    formData.delete("url");
    formData.delete("image");
  }

  return (
    <main className="min-h-screen p-4">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg mb-6 leading-relaxed text-center">
            Fill in the form below to create a new project.
          </p>

          <form className="mt-6 flex flex-col gap-4">
            <Input label="Title" name="title" variant="bordered" />

            <Textarea label="Description" name="description" variant="bordered" />

            <Input type="url" label="URL" name="url" variant="bordered" />

            <input
              type="file"
              id="image"
              name="image"
              className="file:p-1.5 file:bg-blue-500 file:border-0 file:hover:bg-blue-600 file:rounded-lg file:text-white file:mr-5"
            />

            <Button type="submit" variant="ghost" color="success" formAction={formSubmit}>
              Submit
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
