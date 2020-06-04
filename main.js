function array()
{
    /*
     * Attributes:
     *
     * - values: Array to be sorted
     * - size: Length of array
     *
     * - rect_width: Contains widths (in px) of each array element to be drawn
     *               on canvas, computed with canvas width and length of array
     * - rect_start_pt: Contains horizontal start positions on canvas, used
     *                  for drawing array elements on canvas
     * - rect_ht: Contains heights (in px) of each array element to be drawn
     *            on canvas, to be computed using array element, maximum array
     *            element and canvas height
     *
     * - sort_algo: Sort algorithm to use, determined from HTML button input
     *
     */
    this.values = [];
    this.size = 100;

    this.max_value = 0;

    this.rect_width = (canvas_width - 2*(this.size - 1)) / this.size;
    this.rect_start_pt = [];
    this.rect_ht = [];

    this.sort_algo = -1; 
}


array.prototype.initValues = function(ordering)
{
    /*
     * Initialise array elements and computes all required attributes
     *
     * Input:
     * - ordering: If 0, initialise all elements randomly. 
     *             If 1, initialise array to be reverse sorted.
     *
     */

    // Do nothing if animations are ongoing
    if ((drawArrayId != -1) || (animationId != -1))
        return;

    this.values = [];
    this.size = 100;

    this.max_value = 0;

    this.rect_width = (canvas_width - 2*(this.size - 1)) / this.size;
    this.rect_start_pt = [];
    this.rect_ht = [];


    if (ordering == 0)
        for (let i=0; i < this.size; i++)
        {
            let v = rand(0, 1000);
            this.values.push(v);

            if (v > this.max_value)
                this.max_value = v;
        }
    else if (ordering == 1)
        for (let i=0; i < this.size; i++)
        {
            let v = this.size - i;
            this.values.push(v);

            if (v > this.max_value)
                this.max_value = v;
        }

    for (let i=0; i < this.size; i++)
    {
        // Spaces of 2 px are left in-between neighbouring array elements
        this.rect_start_pt.push(i * (this.rect_width + 2));
        this.rect_ht.push(Math.floor((this.values[i] / this.max_value) * canvas.height));
    }

    ctx.clearRect(0, 0, canvas_width, canvas_height);
    drawArray(this);

    function drawArray(A)
    {
        /*
         * Creates animation of array initialisation 
         */
        let i = 0;
        drawArrayId = setInterval(frame, 1);

        function frame()
        {
            if (i == A.size)
            {
                clearInterval(drawArrayId);
                drawArrayId = -1;
            }
            else
            {
                ctx.fillRect(A.rect_start_pt[i], canvas_height-A.rect_ht[i], A.rect_width, A.rect_ht[i]);
                i++;
            }
        }
    }
}


array.prototype.sortAlgo = function(sort_algo)
{
    /*
     * Selects sorting algorithm based on HTML button input
     *
     */
    if ((drawArrayId != -1) || (animationId != -1))
        return;

    this.sort_algo = sort_algo;
}


array.prototype.sort = function()
{
    /*
     * Sorts array
     *
     */

    // Checks if array has been initialised and chosen sort algorithm 
    // has been selected
    if ((this.values.length == 0) || (this.sort_algo == -1))
    {
        let error_msg = '';
        if (this.values.length == 0)
            error_msg = error_msg + 'Array not initialised!' + '\n';
        if (this.sort_algo == -1)
            error_msg = error_msg + 'Sort algorithm not selected!';
        alert(error_msg);

        return;
    }

    // Do nothing if animations are ongoing
    if ((drawArrayId != -1) || (animationId != -1))
        return;

    // Array variables required for creating sort animations
    let from = [];
    let to = [];

    let left = [];
    let right = [];
    let merged = [];

    if (this.sort_algo == 0)
        this.selectionSort(from, to);
    if (this.sort_algo == 1)
        this.bubbleSort(from, to);
    if (this.sort_algo == 2)
        this.insertionSort(from, to);
    if (this.sort_algo == 3)
        this.values = this.mergeSort(0, this.size-1, left, right, merged, 1);
    if (this.sort_algo == 4)
        this.quickSort(0, this.size-1, from, to, false, 1);
    if (this.sort_algo == 5)
        this.quickSort(0, this.size-1, from, to, true, 1);
}


array.prototype.selectionSort = function(from, to)
{
    /*
     * Selection sort
     *
     */
    let min_idx = -1;
    let tmp = -1;

    for (i=0; i<this.values.length; i++)
    {
        min_idx = i;
        for (j=i+1; j<this.values.length; j++)
        {
            from.push(j);
            to.push(j);
            if (this.values[j] < this.values[min_idx])
                min_idx = j;
        }

        tmp = this.values[i];
        this.values[i] = this.values[min_idx];
        this.values[min_idx] = tmp;

        from.push(i);
        to.push(min_idx);
    }

    inPlaceAnimation(from, to, this, 1);
}


array.prototype.bubbleSort = function(from, to)
{
    /*
     * Bubble sort
     *
     */
    let tmp = -1;

    for (let i=0; i<this.values.length; i++)
        for (let j=0; j<this.values.length-i-1; j++)
        {
            if (this.values[j+1] < this.values[j])
            {
                tmp = this.values[j+1];
                this.values[j+1] = this.values[j];
                this.values[j] = tmp;

                from.push(j+1);
                to.push(j);
            }
        }

    inPlaceAnimation(from, to, this, 1);
}


array.prototype.insertionSort = function(from, to)
{
    /*
     * Insertion sort
     *
     */
    let j = -1;
    let tmp = -1;

    for (let i=1; i<this.values.length; i++)
    {
        j = i;
        while ((this.values[j] < this.values[j-1]) && (j >= 1))
        {
            tmp = this.values[j]
            this.values[j] = this.values[j-1];
            this.values[j-1] = tmp;

            from.push(j);
            to.push(j-1);

            j--;
        }
    }

    inPlaceAnimation(from, to, this, 1);
}


array.prototype.mergeSort = function(p, q, left, right, merged, rec_depth)
{
    /*
     * Merge sort
     *
     */
    let sorted = [];

    if (p == q)
    {
        sorted.push(this.values[p]);
        return sorted;
    }

    let mid = Math.floor((p + q) / 2);

    let sorted1 = this.mergeSort(p, mid, left, right, merged, rec_depth+1);
    let sorted2 = this.mergeSort(mid+1, q, left, right, merged, rec_depth+1);

    /* Merging step */
    let i = 0;
    let j = 0;
    
    while ((i < sorted1.length) || (j < sorted2.length))
    {
        if ((i < sorted1.length) && (j < sorted2.length))
            if (sorted1[i] < sorted2[j])
            {
                sorted.push(sorted1[i]);
                i++;
            }
            else
            {
                sorted.push(sorted2[j]);
                j++;
            }

        if ((i >= sorted1.length) && (j < sorted2.length))
        {
            sorted.push(sorted2[j]);
            j++;
        }
        if ((j >= sorted2.length) && (i < sorted1.length))
        {
            sorted.push(sorted1[i]);
            i++;
        }
    }
    /* End of merging step */
    left.push(p);
    right.push(q);
    merged.push(sorted);

    if (rec_depth == 1)
        mergeSortAnimation(left, right, merged, this);

    return sorted;
}


array.prototype.quickSort = function(p, q, from, to, randomise, rec_depth)
{
    /*
     * Quicksort
     *
     */
    if (p < q)
    {
        /* Partioning step*/
        if (randomise)
        {
            let p_ = rand(p, q);
            var tmp = this.values[p_];
            this.values[p_] = this.values[p];
            this.values[p] = tmp;

            from.push(p_);
            to.push(p);

            var pivot = this.values[p];
        }
        else
        {
            var pivot = this.values[p];
            var tmp = -1;
        }

        let i = p;
        for (let j=p+1; j<=q; j++)
        {
            if (this.values[j] <= pivot)
            {
                i++;
                tmp = this.values[j];
                this.values[j] = this.values[i];
                this.values[i] = tmp;

                from.push(j);
                to.push(i);
            }
        }
        tmp = this.values[i];
        this.values[i] = this.values[p];
        this.values[p] = tmp;

        from.push(i);
        to.push(p);
        /*End of partitioning step*/

        this.quickSort(p, i-1, from, to, randomise, rec_depth+1);
        this.quickSort(i+1, q, from, to, randomise, rec_depth+1);
    }

    if (rec_depth == 1)
        inPlaceAnimation(from, to, this, 10);
}


function inPlaceAnimation(from, to, A, interval)
{
    /*
     * Creates animation for in-place sorting algorithms
     *
     */
    let i = 0;
    animationId = setInterval(frame, interval);
    let num_frames = from.length;
    let display_before = true;

    function frame()
    {
        if (i==num_frames)
        {
            clearInterval(animationId);

            if (A.sort_algo == 0)
                displayComplexities('Selection sort', 'n^2', 'n^2', 'n^2', '1');
            if (A.sort_algo == 1)
                displayComplexities('Bubble sort', 'n^2', 'n', 'n^2', '1');
            if (A.sort_algo == 2)
                displayComplexities('Insertion sort', 'n^2', 'n', 'n^2', '1');
            if (A.sort_algo == 3)
                displayComplexities('Merge sort', 'n lg(n)', 'n lg(n)', 'n lg(n)', 'n');
            if (A.sort_algo == 4)
                displayComplexities('Quicksort', 'n lg(n)', 'n lg(n)', 'n^2', '1');
            if (A.sort_algo == 5)
                displayComplexities('Randomised Quicksort', 'n lg(n)', 'n lg(n)', 'n^2', '1');

            animationId = -1;
            A.values = [];
            A.sort_algo = -1;
        }
        else
        {
            if (display_before)
            {
                ctx.fillStyle = 'gray';
                ctx.fillRect(A.rect_start_pt[from[i]], canvas_height-A.rect_ht[from[i]], A.rect_width, A.rect_ht[from[i]]);
                ctx.fillRect(A.rect_start_pt[to[i]], canvas_height-A.rect_ht[to[i]], A.rect_width, A.rect_ht[to[i]]);
            }
            else
            {
                tmp = A.rect_ht[from[i]];
                A.rect_ht[from[i]] = A.rect_ht[to[i]];
                A.rect_ht[to[i]] = tmp;

                ctx.fillStyle = 'black';
                ctx.clearRect(A.rect_start_pt[to[i]]-3, 0, A.rect_width+6, canvas_height);
                ctx.fillRect(A.rect_start_pt[to[i]], canvas_height-A.rect_ht[to[i]], A.rect_width, A.rect_ht[to[i]]);
                ctx.clearRect(A.rect_start_pt[from[i]]-3, 0, A.rect_width+6, canvas_height);
                ctx.fillRect(A.rect_start_pt[from[i]], canvas_height-A.rect_ht[from[i]], A.rect_width, A.rect_ht[from[i]]);

                i++;
            }
            display_before = !(display_before);
        }
    }
}


function mergeSortAnimation(left, right, merged, A)
{
    /*
     * Creates animation for merge sort
     * - This function is required because merge sort does not sort in-place
     *
     */
    let i = 0;
    animationId = setInterval(frame, 50);
    let num_frames = left.length;
    let display_before = true;

    function frame()
    {
        var p = left[i];
        var q = right[i];
        var sorted = merged[i];

        if (i==num_frames)
        {
            clearInterval(animationId);

            displayComplexities('Merge sort', 'n lg(n)', 'n lg(n)', 'n lg(n)', 'n');

            animationId = -1;
            A.values = [];
            A.sort_algo = -1;
        }
        else
        {
            if (display_before)
                ctx.clearRect(A.rect_start_pt[p]-2, 0, A.rect_start_pt[q]-A.rect_start_pt[p]+1, canvas_height);
            else
            {
                for (let j=0; j < sorted.length; j++)
                {
                    let rect_ht = Math.floor((sorted[j] / A.max_value) * canvas.height);
                    ctx.fillRect(A.rect_start_pt[p+j], canvas_height-rect_ht, A.rect_width, rect_ht);
                }

                i++;
            }
            display_before = !(display_before);
        }
    }
}


function displayComplexities(sort_algo, avg_case, best_case, worst_case, space)
{
    /*
     * Shows complexities of sort algorithm on canvas
     *
     */
    ctx.font = 'bold 20px Verdana';
    ctx.fillText(sort_algo, 10, 20);

    ctx.font = '20px Verdana';
    ctx.fillText('Average case: ' + avg_case, 10, 60);
    ctx.fillText('Best case      : ' + best_case, 10, 90);
    ctx.fillText('Worst case    : ' + worst_case, 10, 120);
    ctx.fillText('Space            : ' + space, 10, 150);
}


function rand(min, max)
{
    /*
     * Returns random integer between min and max
     *
     */
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Setup canvas 
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const canvas_width = canvas.width;
const canvas_height = canvas.height;

// Ids indicating if animations are ongoing
animationId = -1;
drawArrayId = -1;

//array object
A = new array();
