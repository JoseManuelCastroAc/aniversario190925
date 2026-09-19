const letterGate = document.getElementById("letterGate");
const openLetterButton = document.getElementById("openLetter");
const app = document.getElementById("app");

const backgroundMusic = document.getElementById("backgroundMusic");
const musicButton = document.getElementById("musicButton");

let letterOpened = false;

backgroundMusic.volume = 0.45;

openLetterButton.addEventListener("click", () => {

    if (letterOpened) {
        return;
    }

    letterOpened = true;

    backgroundMusic.currentTime = 0;

    backgroundMusic.play().catch(error => {
        console.log("No se pudo reproducir la música:", error);
    });

    letterGate.classList.add("opening");

    setTimeout(() => {
        letterGate.classList.add("finishing");
    }, 1900);

    setTimeout(() => {

        app.classList.remove("app-locked");

        app.classList.add("app-visible");

        letterGate.classList.add("hidden");

        musicButton.hidden = false;

    }, 2750);

});

musicButton.addEventListener("click", () => {

    if (backgroundMusic.paused) {

        backgroundMusic.play().catch(error => {
            console.log("No se pudo reproducir la música:", error);
        });

        musicButton.setAttribute(
            "aria-label",
            "Pausar música"
        );

        musicButton.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M9 18V5L20 3V16"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="17" cy="16" r="3"></circle>
            </svg>
        `;

    } else {

        backgroundMusic.pause();

        musicButton.setAttribute(
            "aria-label",
            "Reproducir música"
        );

        musicButton.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M8 5L19 12L8 19Z"></path>
            </svg>
        `;

    }

});

const screens = document.querySelectorAll(".screen");

const navigationButtons =
    document.querySelectorAll("[data-go]");

const transitionLayer =
    document.getElementById("transitionLayer");

let currentScreen =
    document.querySelector(".screen-active");

let changingScreen = false;

navigationButtons.forEach(button => {

    button.addEventListener("click", () => {

        const destination =
            button.dataset.go;

        if (!destination) {
            return;
        }

        changeScreen(destination);

    });

});

function changeScreen(destinationId) {

    const destination =
        document.getElementById(destinationId);

    if (
        !destination ||
        destination === currentScreen ||
        changingScreen
    ) {
        return;
    }

    changingScreen = true;

    transitionLayer.classList.remove("active");

    void transitionLayer.offsetWidth;

    transitionLayer.classList.add("active");

    currentScreen.classList.add("screen-exit");

    setTimeout(() => {

        screens.forEach(screen => {

            screen.classList.remove(
                "screen-active",
                "screen-exit"
            );

        });

        destination.classList.add(
            "screen-active"
        );

        currentScreen = destination;

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto"
        });

    }, 300);

    setTimeout(() => {

        transitionLayer.classList.remove(
            "active"
        );

        changingScreen = false;

    }, 680);

}

const databaseName =
    "NuestroPrimerAno";

const storeName =
    "memories";

let database;

const request =
    indexedDB.open(
        databaseName,
        1
    );

request.onupgradeneeded = event => {

    database =
        event.target.result;

    if (
        !database.objectStoreNames.contains(
            storeName
        )
    ) {

        database.createObjectStore(
            storeName,
            {
                keyPath: "id",
                autoIncrement: true
            }
        );

    }

};

request.onsuccess = event => {

    database =
        event.target.result;

    loadPhotos();

};

request.onerror = () => {

    console.error(
        "No se pudo abrir la base de datos."
    );

};

const photoInput =
    document.getElementById(
        "photoInput"
    );

const photoGallery =
    document.getElementById(
        "photoGallery"
    );

const emptyGallery =
    document.getElementById(
        "emptyGallery"
    );

const photoCounter =
    document.getElementById(
        "photoCounter"
    );

photoInput.addEventListener(
    "change",
    async event => {

        const files =
            Array.from(
                event.target.files
            );

        if (
            !files.length ||
            !database
        ) {
            return;
        }

        for (const file of files) {

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {
                continue;
            }

            try {

                await savePhoto(file);

            } catch (error) {

                console.error(
                    "No se pudo guardar una foto:",
                    error
                );

            }

        }

        photoInput.value = "";

        loadPhotos();

    }
);

function savePhoto(file) {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    storeName,
                    "readwrite"
                );

            const store =
                transaction.objectStore(
                    storeName
                );

            const memory = {

                image: file,

                date:
                    new Date()
                        .toISOString()

            };

            const saveRequest =
                store.add(memory);

            saveRequest.onsuccess =
                () => resolve();

            saveRequest.onerror =
                () => reject();

        }
    );

}

function loadPhotos() {

    if (!database) {
        return;
    }

    const transaction =
        database.transaction(
            storeName,
            "readonly"
        );

    const store =
        transaction.objectStore(
            storeName
        );

    const photoRequest =
        store.getAll();

    photoRequest.onsuccess =
        event => {

            const photos =
                event.target.result
                    .sort(
                        (a, b) =>
                            b.id - a.id
                    );

            renderPhotos(
                photos
            );

        };

}

function renderPhotos(photos) {

    photoGallery.innerHTML = "";

    photoCounter.textContent =
        photos.length === 1
            ? "1 foto"
            : `${photos.length} fotos`;

    if (
        photos.length === 0
    ) {

        emptyGallery.style.display =
            "flex";

        return;

    }

    emptyGallery.style.display =
        "none";

    photos.forEach(photo => {

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "photo-card";

        const image =
            document.createElement(
                "img"
            );

        const imageUrl =
            URL.createObjectURL(
                photo.image
            );

        image.src = imageUrl;

        image.alt =
            "Recuerdo de nuestro aniversario";

        image.onload = () => {

            URL.revokeObjectURL(
                imageUrl
            );

        };

        const deleteButton =
            document.createElement(
                "button"
            );

        deleteButton.className =
            "photo-delete";

        deleteButton.setAttribute(
            "aria-label",
            "Eliminar foto"
        );

        deleteButton.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M7 7L17 17"></path>
                <path d="M17 7L7 17"></path>
            </svg>
        `;

        deleteButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                deletePhoto(
                    photo.id
                );

            }
        );

        card.appendChild(
            image
        );

        card.appendChild(
            deleteButton
        );

        photoGallery.appendChild(
            card
        );

    });

}

function deletePhoto(id) {

    if (!database) {
        return;
    }

    const transaction =
        database.transaction(
            storeName,
            "readwrite"
        );

    const store =
        transaction.objectStore(
            storeName
        );

    store.delete(id);

    transaction.oncomplete =
        () => {

            loadPhotos();

        };

}