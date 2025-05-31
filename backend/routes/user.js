const express = require('express');
const zod = require("zod");
const jwt = require("jsonwebtoken");
const {User, Account} = require("../db");
const {JWT_SECRET} = require('../config');
const {authMiddleware} = require('../middleware');

const router = express.Router();


// signup routes
const signupSchema = zod.object({
    username : zod.string().email(),
    password : zod.string(),
    firstName : zod.string(),
    lastName : zod.string()
});

router.post("/signup", async (req, res) => {
    const { success } = signupSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        })
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    });

    const userId = user._id;

    // initilizing random balance on signup
    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    });

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token
    })
});

// signin route
const signinSchema = zod.object({
    username : zod.string().email(),
    password : zod.string(),
});

router.post("/signin", async (req, res) => {
    const { success } = signinSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const user = await User.findOne({
        username: req.body.username,
        password : req.body.password
    })

    if(user){
        const token = jwt.sign({
            userId : user._id
        }, JWT_SECRET);
        
        res.json({
            "token" : token,
            "message" : "login success.."
        });
        return;
    }

    res.status(411).json({
        message: "Error while logging in",
    })
});


// Route to update user information
const updateBody = zod.object({
	password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
});

router.put("/", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Error while updating information"
        })
    }

    await User.updateOne({ _id: req.userId }, req.body);
	
    res.json({
        message: "Updated successfully"
    })
});


// Route to get users from the backend, filterable via firstName/lastName
//Query Parameter: ?filter = dines

/*
    regex operator :-
        The "$regex" operator in MongoDB is a powerful tool that provides 
        regular expression capabilities for pattern matching within strings in queries.
*/

router.get("/bulk", async(req, res)=>{
    const filter = req.query.filter || "";
    
    const users = await User.find({
        // or query
        $or : [
            {
                firstName : {
                    $regex : filter, 
                    $options : "i" // search case-insensitive
                }
            },
            {
                lastName : {
                    $regex : filter,
                    $options : "i"
                }
            }
        ]
    });

    res.json({
        user : users.map((user)=>({
            username : user.username,
            firstName : user.firstName,
            lastName : user.lastName, 
            _id : user._id
        }))
    });
});


module.exports = router;