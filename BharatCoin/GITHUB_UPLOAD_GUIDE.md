# 🚀 How to Get Your BharatCoin APK via GitHub

Follow these steps exactly — you'll have a downloadable APK in about 15 minutes.

---

## Step 1 — Create a GitHub Account
If you don't have one: https://github.com/signup (it's free)

---

## Step 2 — Create a New Repository

1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `BharatCoin`
   - **Visibility:** Public (or Private)
   - ❌ Do NOT check "Add README" or any other option
3. Click **"Create repository"**

---

## Step 3 — Install Git on Your Computer

- **Windows:** https://git-scm.com/download/win
- **Mac:** Run `xcode-select --install` in Terminal
- **Linux:** `sudo apt install git`

---

## Step 4 — Upload the Project

Open Terminal (or Git Bash on Windows) and run these commands one by one:

```bash
# Go into the project folder (adjust path if needed)
cd path/to/BharatCoin

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial BharatCoin app"

# Connect to your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/BharatCoin.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 5 — Watch the Build

1. Go to your repo on GitHub
2. Click the **"Actions"** tab at the top
3. You'll see **"Build BharatCoin APK"** running
4. Wait ~15 minutes for it to complete ✅

---

## Step 6 — Download Your APK

### Option A — From Releases (recommended):
1. Click **"Releases"** on the right side of your repo
2. Find **"BharatCoin v1.0.x"**
3. Download `BharatCoin-v1.0.apk`

### Option B — From Actions Artifacts:
1. Click **Actions** tab → click the latest run
2. Scroll down to **"Artifacts"**
3. Download **"BharatCoin-APK"**

---

## Step 7 — Install on Your Android Phone

1. Transfer the APK to your phone (WhatsApp, Google Drive, USB cable, etc.)
2. On your phone: **Settings → Security → Enable "Unknown Sources"**
   (or "Install unknown apps" on Android 8+)
3. Open the APK file → tap **Install**
4. Open **BharatCoin** 🎉

---

## 🔄 Future Updates

Every time you make changes and push to GitHub, a new APK is built automatically:

```bash
git add .
git commit -m "Update: description of changes"
git push
```

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails with Gradle error | Check Actions logs, usually a dependency issue |
| "Unknown sources" blocked | Go to Settings → Apps → Special access → Install unknown apps |
| APK won't install | Make sure you're on Android 7.0 or higher |
| Actions tab not showing | Make sure the `.github/workflows/` folder was pushed |

---

## 📧 Need Help?

If the build fails, click the failed job in Actions, read the red error, and share it — it can be fixed!
