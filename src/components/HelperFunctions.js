export const dateDiff= (start) => {
    var startDate = new Date(start);
    var endDate = new Date();
    var diff = endDate - startDate;
    
    const SEC = 1000, MIN = 60 * SEC, HRS = 60 * MIN

    const hrs = Math.floor(diff/HRS)
    const min = Math.floor((diff%HRS)/MIN).toLocaleString('en-US', {minimumIntegerDigits: 2})
    const sec = Math.floor((diff%MIN)/SEC).toLocaleString('en-US', {minimumIntegerDigits: 2})
    const days = Math.floor(hrs/24);
    if(days>0){
        return `${days} days ago`
    }else if(hrs>0){
        return `${hrs} hours ago`
    }else if(min>0){
        return `${min} minutes ago`
    }else{
        return `${sec} seconds ago`
    }
}