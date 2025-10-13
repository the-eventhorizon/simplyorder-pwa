<template>
  <ion-page>
    <ion-content>
      <div class="login">
        <div class="spacer"></div>
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <img class="login-logo" src="@/assets/images/autocolor-wortmarke.png" alt="logo.png">
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <form @submit.prevent="login">
              <div class="form-group">
                <label for="customerNumber">Kundennummer</label>
                <input class="login-input" id="customerNumber" v-model="customerNumber" type="text"
                       placeholder="Nummer eingeben" required/>
              </div>
              <div class="form-group">
                <label for="username">Benutzername</label>
                <input class="login-input" id="username" v-model="username" type="text"
                       placeholder="Benutzernamen eingeben" required/>
              </div>
              <div class="form-group">
                <label for="password">Passwort</label>
                <input class="login-input" id="password" v-model="password" type="password" placeholder="**********"
                       required/>
              </div>
              <div class="form-group">
                <button type="submit" :disabled="isSubmitting">
                  Anmelden
                </button>
              </div>
              <div class="legal-links">
                <a href="https://www.autocolor-zentrum.de/datenschutz/" target="_blank">Datenschutz</a>
                <a href="https://www.autocolor-zentrum.de/impressum/" target="_blank">Impressum</a>
              </div>
            </form>
          </ion-card-content>
        </ion-card>
        <div class="copyright">
          <p>Kapp & Arnold GmbH &copy; 2025</p>
        </div>
      </div>
    </ion-content>
    <SplashScreen v-if="isSubmitting"/>
  </ion-page>
</template>

<style scoped lang="scss">
.login {
  display: flex;
  flex-wrap: wrap;
  align-content: space-around;
  justify-content: center;
  padding: 15px;
  height: 100%;
  background-image: linear-gradient(rgba(18, 50, 116, 0), rgba(18, 50, 116, 1)), url('@/assets/images/background.jpg');
  background-size: cover;
  background-position: center;
}

ion-card {
  border-radius: 16px;
  width: 100%;
  margin-top: 100px;

  ion-card-title {
    display: flex;
    justify-content: center;
    align-items: center;

    .login-logo {
      max-width: 100%;
      max-height: 120px;
      margin: 0 auto;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    color: black;
    margin-bottom: 16px;

    label {
      margin-bottom: 8px;
      font-size: 16px;
    }

    .login-input {
      background: transparent;
      border: 1px solid #c7c7c7;
      padding: 16px;
      border-radius: 8px;
    }

    button {
      border-radius: 8px;
      font-size: 16px;
      padding: 16px;
      background-color: #f59c00;
    }
  }

  .legal-links {
    display: flex;
    justify-content: space-evenly;
    margin-top: 16px;

    a {
      color: #000;
      text-decoration: none;
      font-size: 14px;
    }
  }
}

.copyright {
  color: white;
}
</style>

<script lang="ts">
import {onMounted, ref} from "vue";
import {IonPage, IonContent} from "@ionic/vue";
import {useRouter} from "vue-router";
import SplashScreen from "~/SplashScreen.vue"
import ApiService from "@/services/ApiService";
import {App as CapacitorApp} from "@capacitor/app";

export default {
  components: {SplashScreen, IonPage, IonContent},
  setup() {
    const customerNumber = ref("");
    const username = ref("");
    const password = ref("");
    const isSubmitting = ref(false);
    const router = useRouter();

    const login = async () => {
      isSubmitting.value = true

      try {
        const response = await ApiService.login(customerNumber.value, username.value, password.value);
        if (response) {
          await router.push("/");
        } else {
          await router.push("login");
        }
      } catch (error) {
        alert((error as Error).message || "Bei der Anmeldung ist ein Fehler aufgetreten.");
      } finally {
        await new Promise((resolve) => setTimeout(resolve, 500));
        isSubmitting.value = false
      }
    };

    onMounted(() => {
      CapacitorApp.addListener('backButton', () => {
        if (router.currentRoute.value.path === "/login") {
          CapacitorApp.exitApp();
        } else {
          router.back();
        }
      })
    })

    return {
      login,
      username,
      password,
      isSubmitting,
      customerNumber,
    }
  },
};
</script>