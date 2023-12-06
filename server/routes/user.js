const express = require('express');
const router = express.Router();
const path = require('path');

// mongodb user & user verification model
const User = require('./../models/user');
const UserVerification = require('./../models/userVerification');

const nodemailer = require('nodemailer');

const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const bcrypt = require('bcrypt');

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
})

transporter.verify((error, success) => {
    if (error) {
        console.log(error)
    } else {
        console.log("Ready for messages");
        console.log(success)
    }
})

// Signup
router.post('/signup', (req, res) => {
    let { name, email, password } = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();

    if (name == "" || email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty Input Fields"
        });
    } else if (!/^[a-zA-Z\s]*$/.test(name)) {
        res.json({
            status: "FAILED",
            message: "Invalid Name Entered"
        });
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: "FAILED",
            message: "Invalid Email Entered"
        });
    } else if (password.length < 8) {
        res.json({
            status: "FAILED",
            message: "Please input a password of at least 8 characters"
        });
    } else {
        User.find({ email }).then(result => {
            if (result.length) {
                res.json({
                    status: "FAILED",
                    message: "User with the entered email already exists"
                });
            } else {
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    // Assuming dateOfBirth is not a required field in the schema
                    const newUser = new User({
                        name,
                        email,
                        password: hashedPassword,
                        verified: false
                    });

                    newUser.save().then(result => {
                        sendVerificationEmail(result, res);
                    })
                        .catch(err => {
                            res.json({
                                status: "FAILED",
                                message: "An error occurred while saving user account"
                            });
                        })
                })
                    .catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error occurred while hashing password"
                        });
                    });
            }
        })
            .catch(err => {
                console.log(err)
                res.json({
                    status: "FAILED",
                    message: "An error occurred while checking for existing users"
                });
            })
    }
})

const sendVerificationEmail = ({ _id, email }, res) => {
    const currentUrl = "http://localhost:5000/";

    const uniqueString = uuidv4() + _id;

    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify Your Email",
        html: `<p>Verify your email address to complete the signup and login to your account</p>
        <p>This link <b>expires in 1 hour</b>.</p>
        <p>Press <a href=${currentUrl + "user/verify/" + _id + "/" + uniqueString}>here</a> to proceed.</p>`
    };

    const saltRounds = 10;
    bcrypt.hash(uniqueString, saltRounds)
        .then((hashedUniqueString) => {
            const newVerification = new UserVerification({
                userId: _id,
                uniqueString: hashedUniqueString,
                createdAt: Date.now(),
                expiresAt: Date.now() + 360000
            });

            newVerification
                .save()
                .then(() => {
                    transporter.sendMail(mailOptions)
                        .then(() => {
                            res.json({
                                status: "PENDING",
                                message: "Verification email sent"
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.json({
                                status: "FAILED",
                                message: "Verification email failed to send"
                            });
                        });
                })
                .catch((error) => {
                    console.log(error);
                    res.json({
                        status: "FAILED",
                        message: "Couldn't save email verification data"
                    });
                });
        })
        .catch(() => {
            res.json({
                status: "FAILED",
                message: "An error occurred while hashing email data"
            });
        })
};

router.get("/verify/:userId/:uniqueString", (req, res) => {
    let { userId, uniqueString } = req.params;

    UserVerification
        .find({ userId })
        .then((result) => {
            if (result.length > 0) {
                const { expiresAt } = result[0];
                const hashedUniqueString = result[0].uniqueString;

                if (expiresAt < Date.now()) {
                    UserVerification
                        .deleteOne({ userId })
                        .then(result => {
                            User
                                .deleteOne({ _id: userId })
                                .then(() => {
                                    let message = "your verification link has expired please signup again";
                                    res.redirect(`/user/verified?error=true&message=${message}`);
                                })
                                .catch((error) => {
                                    console.log(error);
                                    let message = "clearing user with expired usinque string failed";
                                    res.redirect(`/user/verified?error=true&message=${message}`);
                                })
                        }
                        )
                        .catch((error) => {
                            console.log(error);
                            let message = "An error occured while clearing expired verification record";
                            res.redirect(`/user/verified?error=true&message=${message}`);
                        })
                } else {
                    //valid record exist
                    bcrypt.compare(uniqueString, hashedUniqueString)
                        .then(result => {
                            if (result) {
                                User.updateOne({ _id: userId }, { verified: true })
                                    .then(() => {
                                        res.sendFile(path.join(__dirname, "./../../client/verified.html"));
                                    })
                                    .catch(error => {
                                        console.log(error);
                                        let message = "An error occured while updating user verification status";
                                        res.redirect(`/user/verified?error=true&message=${message}`);
                                    })


                            } else {
                                let message = "An error occured while comparing unique string check your inbox ";
                                res.redirect(`/user/verified?error=true&message=${message}`);
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            let message = "An error occured while comparing unique string";
                            res.redirect(`/user/verified?error=true&message=${message}`);
                        })
                }
            } else {
                let message = "An error occured while checking user doesnt exit or has been already verified please signup or login";
                res.redirect(`/user/verified?error=true&message=${message}`);
            }
        })
        .catch((error) => {
            console.log(error);
            let message = "An error occured while checking for existing user verification record";
            res.redirect(`/user/verified?error=true&message=${message}`);
        })
})

router.get("/verified", (req, res) => {
    const { error, message } = req.query;
    if (error) {
        res.json(message)
    } else {
        res.sendFile(path.join(__dirname, "./../../client/verified.html"));
    }
})


// Signin
router.post('/signin', (req, res) => {
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();

    if (email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty Input Fields"
        });
    } else {
        User.find({ email })
            .then(data => {
                if (data.length) {
                    const hashedPassword = data[0].password;
                    bcrypt.compare(password, hashedPassword).then(result => {
                        if (result) {
                            console.log(data[0]._id);
                            console.log(data[0].name);
                            console.log(data[0].isAdmin);
                            console.log(data[0].isDisabled);
                            console.log(data[0].email);
                    
                            res.json({
                                status: "SUCCESS",
                                message: "Signin successful",
                                data: {
                                    _id: data[0]._id,
                                    name: data[0].name,
                                    isAdmin : data[0].isAdmin,
                                    isDisabled : data[0].isDisabled,
                                    email: data[0].email  
                                }
                            })
                        } else {
                            res.json({
                                status: "FAILED",
                                message: "Invalid password entered"
                            });
                        }
                    })
                        .catch(err => {
                            res.json({
                                status: "FAILED",
                                message: "An error occurred while comparing passwords"
                            });
                        })
                } else {
                    res.json({
                        status: "FAILED",
                        message: "Invalid credentials entered"
                    });
                }
            })
            .catch(err => {
                res.json({
                    status: "FAILED",
                    message: "An error occurred while checking or existing users"
                });
            })
    }
});


const isAdmin = (req, res, next) => {
    // Assuming you have some way to identify the current user, such as JWT or session
    const userId = req.body.userId;

    User.findById(userId)
        .then(user => {
            if (user && user.isAdmin) {
                req.isAdmin = true;
                next();
            } else {
                res.status(403).json({
                    status: 'FAILED',
                    message: 'Permission denied. User is not an administrator.'
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                status: 'FAILED',
                message: 'An error occurred while checking administrator status.'
            });
        });
};

// Grant admin privilege to a user
router.post('/makeAdmin/:userId', isAdmin, (req, res) => {
    const { userId } = req.params;

    User.findByIdAndUpdate(userId, { isAdmin: true })
        .then(() => {
            res.json({
                status: 'SUCCESS',
                message: 'Admin privilege granted to the user.'
            });
        })
        .catch(error => {
            res.status(500).json({
                status: 'FAILED',
                message: 'An error occurred while granting admin privilege.'
            });
        });
});

// get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, 'name _id email verified isAdmin isDisabled');

        const userList = users.map(user => {
            return {
                name: user.name,
                id: user._id,
                email: user.email,
                verified: user.verified,
                isAdmin: user.isAdmin,
                isDisabled: user.isDisabled
            };
        });

        res.json({
            status: "SUCCESS",
            message: "User list retrieved successfully",
            data: userList
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: "Server error" });
    }
});

// Mark a user as "disabled"
router.post('/toggleDisable/:userId', isAdmin, async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).send("User not found.")
        }

        user.isDisabled = !user.isDisabled;
        await user.save()

        res.status(200).json({
            status: 'SUCCESS',
            message: "User disabled status updated successfully!"
        })

    } catch (error) {
        res.status(500).json({
            status: 'FAILED',
            message: 'An error occurred while changing disabled status.'
        });
    };
});

// Route to change password
router.post('/changePassword', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ message: "Password successfully updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;