import * as aiService from '../Services/ai.service.js'


export const aiGetResult= async (req,res)=>{
    try {
        const {prompt}=req.query;
        const result=await aiService.generateAnswer(prompt)
        res.send(result);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
}